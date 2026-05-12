import { Pool } from "pg";

// Reuse a single pool across hot-reloads in dev and across requests in prod.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return global.__pgPool;
}

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f1_shares (
      code           TEXT PRIMARY KEY,
      driver_name    TEXT NOT NULL,
      team           TEXT NOT NULL,
      persona        TEXT NOT NULL,
      mp3            BYTEA NOT NULL,
      mp3_mime       TEXT NOT NULL DEFAULT 'audio/mpeg',
      video          BYTEA,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at     TIMESTAMPTZ NOT NULL
    );
    -- Idempotent migration: add video column if upgrading from older schema
    ALTER TABLE f1_shares ADD COLUMN IF NOT EXISTS video BYTEA;
    CREATE INDEX IF NOT EXISTS f1_shares_expires_at_idx ON f1_shares(expires_at);

    CREATE TABLE IF NOT EXISTS cannes_sessions (
      id           TEXT PRIMARY KEY,
      activation   TEXT NOT NULL DEFAULT 'f1',
      event        TEXT NOT NULL DEFAULT 'cannes-2026',
      answers      JSONB NOT NULL,
      completed    BOOLEAN NOT NULL DEFAULT FALSE,
      played       BOOLEAN NOT NULL DEFAULT FALSE,
      downloaded   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS cs_activation_idx ON cannes_sessions(activation);
    CREATE INDEX IF NOT EXISTS cs_created_at_idx ON cannes_sessions(created_at);
  `);
  schemaReady = true;
}

// Opportunistic cleanup — run on each share insert; cheap on a small table.
export async function purgeExpired(): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM f1_shares WHERE expires_at < NOW()`);
}

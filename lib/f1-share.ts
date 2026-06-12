import { randomBytes } from "node:crypto";
import { ensureSchema, getPool, purgeExpired } from "./db";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface F1Share {
  code: string;
  driverName: string;
  team: string;
  persona: string;
  mp3: Buffer;
  mp3Mime: string;
  commentary: Buffer | null;
  commentaryMime: string;
  createdAt: Date;
  expiresAt: Date;
}

/** URL-safe base36-style short code (no ambiguous chars like 0/O/I/1). */
function newCode(len = 8): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export async function createShare(input: {
  driverName: string;
  team: string;
  persona: string;
  mp3: Buffer;
  mp3Mime?: string;
  commentary?: Buffer | null;
  commentaryMime?: string;
  video?: Buffer | null;
}): Promise<string> {
  await ensureSchema();
  const pool = getPool();
  const expiresAt = new Date(Date.now() + TTL_MS);

  // Retry on the astronomically rare short-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    try {
      await pool.query(
        `INSERT INTO f1_shares
           (code, driver_name, team, persona, mp3, mp3_mime, commentary, commentary_mime, video, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          code,
          input.driverName.slice(0, 50),
          input.team,
          input.persona,
          input.mp3,
          input.mp3Mime ?? "audio/mpeg",
          input.commentary ?? null,
          input.commentaryMime ?? "audio/mpeg",
          input.video ?? null,
          expiresAt,
        ]
      );
      purgeExpired().catch((err) =>
        console.warn("purgeExpired failed:", err)
      );
      return code;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "23505") throw err; // unique_violation — retry
    }
  }
  throw new Error("Could not allocate a unique share code");
}

export async function updateShareVideo(code: string, video: Buffer): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE f1_shares SET video = $1 WHERE code = $2`,
    [video, code],
  );
}

export async function hasVideo(code: string): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query<{ has_video: boolean }>(
    `SELECT video IS NOT NULL AS has_video FROM f1_shares WHERE code = $1 AND expires_at > NOW()`,
    [code],
  );
  return res.rows[0]?.has_video ?? false;
}

export async function getShare(code: string): Promise<F1Share | null> {
  await ensureSchema();
  const pool = getPool();
  const res = await pool.query<{
    code: string;
    driver_name: string;
    team: string;
    persona: string;
    mp3: Buffer;
    mp3_mime: string;
    commentary: Buffer | null;
    commentary_mime: string;
    created_at: Date;
    expires_at: Date;
  }>(
    `SELECT code, driver_name, team, persona, mp3, mp3_mime, commentary, commentary_mime, created_at, expires_at
       FROM f1_shares
      WHERE code = $1
        AND expires_at > NOW()`,
    [code]
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    code: row.code,
    driverName: row.driver_name,
    team: row.team,
    persona: row.persona,
    mp3: row.mp3,
    mp3Mime: row.mp3_mime,
    commentary: row.commentary ?? null,
    commentaryMime: row.commentary_mime ?? "audio/mpeg",
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

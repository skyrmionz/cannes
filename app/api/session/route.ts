import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";

function newId(): string {
  return randomBytes(6).toString("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = newId();

  try {
    await ensureSchema();
    const pool = getPool();
    // Strip name before storing — used only ephemerally for track personalisation.
    const { name: _name, ...anonymousAnswers } = (body.answers ?? {}) as Record<string, unknown>;
    await pool.query(
      `INSERT INTO cannes_sessions (id, answers, completed) VALUES ($1, $2, $3)`,
      [id, JSON.stringify(anonymousAnswers), body.completed ?? false]
    );
  } catch (e) {
    console.error("Session insert error:", e);
  }

  return Response.json({ id });
}

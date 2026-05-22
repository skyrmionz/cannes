import { NextRequest } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { code } = await request.json().catch(() => ({ code: null })) as { code?: string };
  if (!code) return Response.json({ ok: false }, { status: 400 });

  try {
    await ensureSchema();
    const pool = getPool();
    await pool.query(
      `INSERT INTO cannes_scans (share_code) VALUES ($1)`,
      [code]
    );
  } catch (e) {
    console.error("Scan insert error:", e);
  }

  return Response.json({ ok: true });
}

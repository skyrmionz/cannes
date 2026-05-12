import { NextRequest } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const sets: string[] = [];
  const vals: unknown[] = [];

  if (body.played    !== undefined) { sets.push(`played = $${sets.length + 1}`);     vals.push(body.played); }
  if (body.downloaded !== undefined) { sets.push(`downloaded = $${sets.length + 1}`); vals.push(body.downloaded); }

  if (sets.length) {
    try {
      await ensureSchema();
      const pool = getPool();
      vals.push(id);
      await pool.query(
        `UPDATE cannes_sessions SET ${sets.join(", ")} WHERE id = $${vals.length}`,
        vals
      );
    } catch (e) {
      console.error("Session update error:", e);
    }
  }

  return Response.json({ ok: true });
}

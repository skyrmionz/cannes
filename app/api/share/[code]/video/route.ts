import { NextRequest } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST — store an MP4 blob against the share code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!code) return Response.json({ error: "Missing code" }, { status: 400 });

  const formData = await request.formData();
  const file = formData.get("video");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "video field required" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 150 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 150 MB)" }, { status: 413 });
  }

  try {
    await ensureSchema();
    const pool = getPool();
    const res = await pool.query(
      `UPDATE f1_shares SET video = $1 WHERE code = $2 AND expires_at > NOW()`,
      [bytes, code],
    );
    if (res.rowCount === 0) {
      return Response.json({ error: "Share not found or expired" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("video store failed:", err);
    return Response.json({ error: "Store failed" }, { status: 500 });
  }
}

// GET — stream the stored MP4
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!code) return Response.json({ error: "Missing code" }, { status: 400 });

  try {
    await ensureSchema();
    const pool = getPool();
    const res = await pool.query<{ video: Buffer }>(
      `SELECT video FROM f1_shares WHERE code = $1 AND expires_at > NOW()`,
      [code],
    );
    const row = res.rows[0];
    if (!row?.video) {
      return Response.json({ error: "Video not ready" }, { status: 404 });
    }
    return new Response(row.video.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="anthem-${code}.mp4"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("video fetch failed:", err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}

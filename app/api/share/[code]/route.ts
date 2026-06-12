import { NextRequest } from "next/server";
import { getShare, hasVideo } from "@/lib/f1-share";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return Response.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const share = await getShare(code);
    if (!share) {
      return Response.json(
        { error: "Not found or expired" },
        { status: 404 }
      );
    }
    const videoReady = await hasVideo(share.code);
    return Response.json({
      driverName: share.driverName,
      team: share.team,
      persona: share.persona,
      songUrl: `/api/share/${share.code}/song`,
      commentaryUrl: share.commentary ? `/api/share/${share.code}/commentary` : null,
      videoUrl: videoReady ? `/api/share/${share.code}/video` : null,
      expiresAt: share.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("share lookup failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

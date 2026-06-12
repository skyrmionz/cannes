import { NextRequest } from "next/server";
import { getShare } from "@/lib/f1-share";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  try {
    const share = await getShare(code);
    if (!share || !share.commentary) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(new Uint8Array(share.commentary), {
      headers: {
        "Content-Type": share.commentaryMime ?? "audio/mpeg",
        "Content-Length": String(share.commentary.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return new Response(msg, { status: 500 });
  }
}

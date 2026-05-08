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
    if (!share) {
      return new Response("Not found or expired", { status: 404 });
    }
    return new Response(new Uint8Array(share.mp3), {
      headers: {
        "Content-Type": share.mp3Mime,
        "Content-Length": String(share.mp3.length),
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    console.error("share song stream failed:", err);
    return new Response("Server error", { status: 500 });
  }
}

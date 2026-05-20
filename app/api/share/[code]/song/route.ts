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

    const buf = new Uint8Array(share.mp3);
    const total = buf.length;
    const rangeHeader = _request.headers.get("range");

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : total - 1;
        const chunkLength = end - start + 1;
        return new Response(buf.slice(start, end + 1), {
          status: 206,
          headers: {
            "Content-Type": share.mp3Mime,
            "Content-Length": String(chunkLength),
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600, immutable",
          },
        });
      }
    }

    return new Response(buf, {
      headers: {
        "Content-Type": share.mp3Mime,
        "Content-Length": String(total),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    console.error("share song stream failed:", err);
    return new Response("Server error", { status: 500 });
  }
}

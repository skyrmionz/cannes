import { NextRequest } from "next/server";
import { getStatus } from "@/lib/replicate";
import { persistMp3 } from "@/lib/blob-storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  try {
    const status = await getStatus(jobId);
    // On completion, upload the MP3 to Vercel Blob so the URL is stable for
    // 1-hour share links even after Replicate expires its copy.
    if (status.status === "complete" && status.mp3Url) {
      const stableUrl = await persistMp3(status.mp3Url);
      return Response.json({ ...status, mp3Url: stableUrl });
    }
    return Response.json(status);
  } catch (err) {
    console.error("song-status failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

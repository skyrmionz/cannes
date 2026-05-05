import { put } from "@vercel/blob";

/**
 * Downloads the MP3 from Replicate and re-uploads it to Vercel Blob so we have
 * a stable URL that outlives Replicate's ~1 hour output retention.
 * Returns the Blob URL, or the original URL if BLOB_READ_WRITE_TOKEN isn't set
 * (dev fallback — local dev still works without Blob configured).
 */
export async function persistMp3(replicateUrl: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return replicateUrl;
  }

  try {
    const res = await fetch(replicateUrl);
    if (!res.ok) {
      throw new Error(`fetch from replicate ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = `f1-song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      token,
    });
    return blob.url;
  } catch (err) {
    console.error("persistMp3 failed; falling back to replicate URL:", err);
    return replicateUrl;
  }
}

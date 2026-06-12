import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import os from "os";
import fs from "fs";
import { Storage } from "@google-cloud/storage";
import { createShare, updateShareVideo } from "@/lib/f1-share";
import { buildArc, elevenLabsTTS } from "@/app/api/commentary/route";
import { renderVideoToMp4 } from "@/lib/render-video";

const GCS_BUCKET = "f1-cannes-songs";

function getStorage(): Storage {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonStr) {
    try {
      const tmpPath = path.join(os.tmpdir(), "gcp-sa-share.json");
      fs.writeFileSync(tmpPath, jsonStr);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    } catch { /* fall through to ADC */ }
  }
  return new Storage();
}

async function fetchSongFromGCS(filename: string): Promise<Buffer> {
  const storage = getStorage();
  const [buf] = await storage.bucket(GCS_BUCKET).file(filename).download();
  return buf;
}

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (
    typeof b.driverName !== "string" ||
    typeof b.team !== "string" ||
    typeof b.persona !== "string" ||
    typeof b.mp3Url !== "string"
  ) {
    return Response.json(
      { error: "driverName, team, persona, mp3Url required" },
      { status: 400 }
    );
  }

  const grandPrix   = typeof b.grandPrix   === "string" ? b.grandPrix   : "Monaco";
  const celebration = typeof b.celebration === "string" ? b.celebration : "jump";

  try {
    let stemWav: Buffer;
    let mp3Mime: string;

    if (b.mp3Url.startsWith("/api/songs/")) {
      // Songs live in GCS — fetch directly, don't look on disk
      const filename = b.mp3Url.replace("/api/songs/", "");
      stemWav = await fetchSongFromGCS(filename);
      mp3Mime = "audio/wav";
    } else if (b.mp3Url.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", b.mp3Url);
      stemWav = await readFile(filePath);
      mp3Mime = b.mp3Url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
    } else {
      const mp3Res = await fetch(b.mp3Url);
      if (!mp3Res.ok) {
        return Response.json(
          { error: `Upstream fetch failed: ${mp3Res.status}` },
          { status: 502 }
        );
      }
      stemWav = Buffer.from(await mp3Res.arrayBuffer());
      mp3Mime = mp3Res.headers.get("content-type") ?? "audio/wav";
    }

    // Generate commentary — enhancement-only (non-fatal if it fails)
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    let commentaryBuf: Buffer | null = null;
    if (elevenKey) {
      try {
        const male   = process.env.ELEVENLABS_VOICE_MALE   ?? "KWgrCrnZUL9fUdhsHwbS";
        const female = process.env.ELEVENLABS_VOICE_FEMALE ?? "bsGbk3T29FEq9lQ1FeYd";
        const voiceId = Math.random() < 0.5 ? male : female;
        const arc = await buildArc(b.driverName as string, grandPrix, celebration, b.team as string);
        const fullScript = arc.map((l) => l.text).join("  ...  ");
        commentaryBuf = await elevenLabsTTS(fullScript, voiceId, elevenKey);
      } catch { /* non-fatal */ }
    }

    const code = await createShare({
      driverName: b.driverName,
      team: b.team,
      persona: b.persona,
      mp3: stemWav,
      mp3Mime,
      commentary: commentaryBuf,
      commentaryMime: "audio/mpeg",
    });

    // Fire-and-forget video render — runs after response is sent.
    // Heroku's H12 only kills the HTTP response; the Node process keeps running.
    const driverName = b.driverName as string;
    (async () => {
      try {
        const videoBuf = await renderVideoToMp4(stemWav, mp3Mime, driverName);
        await updateShareVideo(code, videoBuf);
      } catch (err) {
        console.error(`Video render failed for ${code}:`, err);
      }
    })();

    return Response.json({ code });
  } catch (err) {
    console.error("share create failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { createShare } from "@/lib/f1-share";
import { buildArc, elevenLabsTTS } from "@/app/api/commentary/route";
import { mixCommentaryIntoStem } from "@/lib/audio-mix";

export const runtime = "nodejs";
export const maxDuration = 90;

/** Wrap raw PCM bytes (44100 Hz, 16-bit, 1 ch) in a minimal WAV header. */
function pcmToWav(pcm: Buffer, sampleRate = 44100, numChannels = 1): Buffer {
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.allocUnsafe(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Attempt to bake commentary into the stem WAV.
 * Returns the baked WAV, or the original stem if anything fails.
 */
async function bakeCommentary(
  stemWav: Buffer,
  driverName: string,
  grandPrix: string,
  celebration: string,
  team: string,
): Promise<Buffer> {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) return stemWav;

  try {
    const arc = await buildArc(driverName, grandPrix, celebration, team);

    // Generate all commentary clips in parallel
    const voiceId = process.env.ELEVENLABS_VOICE_MALE ?? "KWgrCrnZUL9fUdhsHwbS";
    const clips = await Promise.all(
      arc.map((line) => elevenLabsTTS(line.text, voiceId, elevenKey))
    );

    // Mix each clip into the stem sequentially (each mix returns a new buffer)
    let mixed = stemWav;
    for (let i = 0; i < arc.length; i++) {
      const pcm = clips[i];
      if (!pcm) continue;
      // elevenLabsTTS returns raw PCM from pcm_44100 format — wrap in WAV
      const clipWav = pcmToWav(pcm);
      mixed = mixCommentaryIntoStem(mixed, clipWav, arc[i].offsetSeconds);
    }

    return mixed;
  } catch (err) {
    console.warn("bakeCommentary failed, using dry stem:", err);
    return stemWav;
  }
}

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

  // grandPrix and celebration are optional — used for commentary baking
  const grandPrix   = typeof b.grandPrix   === "string" ? b.grandPrix   : "Monaco";
  const celebration = typeof b.celebration === "string" ? b.celebration : "jump";

  try {
    let stemWav: Buffer;
    let mp3Mime: string;

    if (b.mp3Url.startsWith("/")) {
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

    // Bake commentary into the WAV before storing — this is what gets sent to the phone
    const bakedWav = await bakeCommentary(
      stemWav,
      b.driverName,
      grandPrix,
      celebration,
      b.team,
    );

    const code = await createShare({
      driverName: b.driverName,
      team: b.team,
      persona: b.persona,
      mp3: bakedWav,
      mp3Mime,
    });
    return Response.json({ code });
  } catch (err) {
    console.error("share create failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import os from "os";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 45;

function randomVoice(): string {
  const male   = process.env.ELEVENLABS_VOICE_MALE   ?? "KWgrCrnZUL9fUdhsHwbS";
  const female = process.env.ELEVENLABS_VOICE_FEMALE ?? "bsGbk3T29FEq9lQ1FeYd";
  return Math.random() < 0.5 ? male : female;
}

function setupGoogleAuth(): boolean {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return false;
  try {
    const tmpPath = path.join(os.tmpdir(), "gcp-sa.json");
    fs.writeFileSync(tmpPath, jsonStr, { mode: 0o600 });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    return true;
  } catch {
    return false;
  }
}

export interface CommentaryLine {
  offsetSeconds: number;
  text: string;
}

/**
 * Generates a 4-beat race arc that fits a 40-second track.
 * Returns an array of { offsetSeconds, text } objects.
 */
async function buildArc(
  name: string,
  grandPrix: string,
  celebration: string,
  team: string,
): Promise<CommentaryLine[]> {
  const fallback = fallbackArc(name, grandPrix, team);

  if (!setupGoogleAuth()) return fallback;

  const project  = process.env.VERTEX_PROJECT;
  const location = process.env.VERTEX_LOCATION ?? "us-central1";
  if (!project) return fallback;

  const prompt = [
    `You are an F1 race commentator. Write a 4-part voiceover arc for a 40-second personalised fan track.`,
    `Fan name: "${name}". Circuit: ${grandPrix}. Celebration style: ${celebration}.`,
    ``,
    `Rules:`,
    `- Part 1 (offset 0s): ~8 words. Name is the FIRST word. Lights out, explosive start.`,
    `- Part 2 (offset 10s): ~10 words. Being pushed hard, intense battle, challenged.`,
    `- Part 3 (offset 22s): ~10 words. Overtaken briefly, then fights back and reclaims position.`,
    `- Part 4 (offset 34s): ~10 words. Crosses line, euphoric, shout the NAME loudly. No team name.`,
    ``,
    `Return ONLY a valid JSON array, no markdown, no explanation:`,
    `[{"offsetSeconds":0,"text":"..."},{"offsetSeconds":10,"text":"..."},{"offsetSeconds":22,"text":"..."},{"offsetSeconds":34,"text":"..."}]`,
  ].join("\n");

  try {
    const ai = new GoogleGenAI({ vertexai: true, project, location });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const raw = response.text?.trim() ?? "";
    // Strip any accidental markdown fences
    const json = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(json) as CommentaryLine[];
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

function fallbackArc(name: string, grandPrix: string, team: string): CommentaryLine[] {
  const n = name || "Champion";
  const t = team || "the team";
  return [
    { offsetSeconds: 0,  text: `${n} is on pole — lights out, GO!` },
    { offsetSeconds: 10, text: `Into sector two at ${grandPrix}, pushing hard — there's a challenge!` },
    { offsetSeconds: 22, text: `${n} is overtaken! But wait — finds the gap, makes the move, takes it back!` },
    { offsetSeconds: 34, text: `IT'S ${n.toUpperCase()}!! THEY'VE DONE IT!! THE CROWD GOES ABSOLUTELY WILD!!` },
  ];
}

async function elevenLabsTTS(text: string, voiceId: string, apiKey: string): Promise<Buffer | null> {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_44100`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name        = typeof b.name        === "string" ? b.name.trim().slice(0, 40) : "Champion";
  const grandPrix   = typeof b.grandPrix   === "string" ? b.grandPrix   : "Monaco";
  const celebration = typeof b.celebration === "string" ? b.celebration : "jump";
  const team        = typeof b.team        === "string" ? b.team        : "the team";

  // structured=true → return JSON arc for the bake pipeline (no audio)
  const structured  = b.structured === true;

  const arc = await buildArc(name, grandPrix, celebration, team);

  if (structured) {
    return Response.json({ arc });
  }

  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const voiceId   = randomVoice();

  if (!elevenKey) {
    return Response.json({ arc });
  }

  // For kiosk live playback: concatenate all lines into one script with natural pauses,
  // return as a single audio stream so the client can play it with timed offsets via JS.
  // We return the arc metadata in a header so the client knows when to play each chunk.
  const fullScript = arc.map((l) => l.text).join("  ...  ");

  const ttsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": elevenKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: fullScript,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!ttsRes.ok) {
    return Response.json({ arc });
  }

  const buffer = await ttsRes.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.byteLength),
      "X-Commentary-Arc": encodeURIComponent(JSON.stringify(arc)),
      "X-Commentary-Voice": voiceId,
    },
  });
}

// Named export so the share route can call this directly without HTTP
export { buildArc, elevenLabsTTS };

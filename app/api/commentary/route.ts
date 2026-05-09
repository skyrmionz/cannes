import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import os from "os";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 30;

function randomVoice(): string {
  const male   = process.env.ELEVENLABS_VOICE_MALE   ?? "KWgrCrnZUL9fUdhsHwbS";
  const female = process.env.ELEVENLABS_VOICE_FEMALE ?? "bsGbk3T29FEq9lQ1FeYd";
  return Math.random() < 0.5 ? male : female;
}

// Write the GCP service account JSON to a temp file so the SDK can find it,
// exactly as the original server.js does.
function setupGoogleAuth(): boolean {
  const jsonStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
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

async function buildScript(
  name: string,
  grandPrix: string,
  celebration: string,
  team: string
): Promise<string> {
  if (!setupGoogleAuth()) {
    return fallbackScript(name, grandPrix, team);
  }

  const project  = process.env.VERTEX_PROJECT;
  const location = process.env.VERTEX_LOCATION ?? "us-central1";
  if (!project) return fallbackScript(name, grandPrix, team);

  const prompt = [
    `Write a punchy F1 race-commentary voiceover, maximum 50 words, spoken aloud in about 7 seconds.`,
    `The fan's name is "${name}". Their favourite circuit is ${grandPrix}. Their favourite team is ${team}. Their celebration style: ${celebration}.`,
    `Structure: (1) Their name surging to the front, (2) intense battle into the final corner, (3) ${name} pulling away, (4) chequered flag — crowd erupts.`,
    `Output ONLY the spoken words. No stage directions. No punctuation beyond commas and exclamation marks. Single line.`,
  ].join(" ");

  try {
    const ai = new GoogleGenAI({ vertexai: true, project, location });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text?.trim() ?? fallbackScript(name, grandPrix, team);
  } catch {
    return fallbackScript(name, grandPrix, team);
  }
}

function fallbackScript(name: string, grandPrix: string, team: string): string {
  const n = name || "Champion";
  return `${n} is making a move! Into the final corner at ${grandPrix} — ${n} won't give an inch! ${team} have done it, ${n} pulls away — it's ${n.toUpperCase()}, the crowd goes absolutely wild!`;
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

  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const voiceId   = randomVoice();
  const script    = await buildScript(name, grandPrix, celebration, team);

  if (!elevenKey) {
    return Response.json({ script });
  }

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
        text: script,
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
    return Response.json({ script });
  }

  const buffer = await ttsRes.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.byteLength),
      "X-Commentary-Script": encodeURIComponent(script),
    },
  });
}

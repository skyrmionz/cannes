import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function randomVoice(): string {
  const male   = process.env.ELEVENLABS_VOICE_MALE   ?? "KWgrCrnZUL9fUdhsHwbS";
  const female = process.env.ELEVENLABS_VOICE_FEMALE ?? "bsGbk3T29FEq9lQ1FeYd";
  return Math.random() < 0.5 ? male : female;
}

async function buildScript(
  name: string,
  grandPrix: string,
  celebration: string,
  team: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return fallbackScript(name, grandPrix, team);
  }

  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.6";

  const prompt = [
    `Write a punchy F1 race-commentary voiceover, maximum 50 words, spoken aloud in about 7 seconds.`,
    `The fan's name is "${name}". Their favourite circuit is ${grandPrix}. Their favourite team is ${team}. Their celebration style: ${celebration}.`,
    `Structure: (1) Their name surging to the front, (2) intense battle into the final corner, (3) ${name} pulling away, (4) chequered flag — crowd erupts.`,
    `Output ONLY the spoken words. No stage directions. No punctuation beyond commas and exclamation marks. Single line.`,
  ].join(" ");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://cannes-experience.herokuapp.com",
      "X-Title": "Cannes F1 Commentary",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 120,
    }),
  });

  if (!res.ok) {
    return fallbackScript(name, grandPrix, team);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? fallbackScript(name, grandPrix, team);
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
  const name        = typeof b.name        === "string" ? b.name.trim().slice(0, 40)  : "Champion";
  const grandPrix   = typeof b.grandPrix   === "string" ? b.grandPrix   : "Monaco";
  const celebration = typeof b.celebration === "string" ? b.celebration : "jump";
  const team        = typeof b.team        === "string" ? b.team        : "the team";

  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const voiceId   = randomVoice();

  const script = await buildScript(name, grandPrix, celebration, team);

  // If no ElevenLabs key, return the script text so the caller can display it.
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
    // TTS failed — return the script so UI can fall back gracefully
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

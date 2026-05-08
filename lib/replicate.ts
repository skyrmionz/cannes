const REPLICATE_BASE = "https://api.replicate.com/v1";
const ELEVENLABS_MUSIC_MODEL = "elevenlabs/music";

export interface MusicStatus {
  status: "pending" | "complete" | "failed";
  mp3Url?: string;
}

function token() {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) throw new Error("REPLICATE_API_TOKEN is not set");
  return t;
}

export async function generate(prompt: string): Promise<{ taskId: string }> {
  const res = await fetch(
    `${REPLICATE_BASE}/models/${ELEVENLABS_MUSIC_MODEL}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          music_length_ms: 30_000,
          force_instrumental: true,
          output_format: "mp3_standard",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate create ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) {
    throw new Error(`Replicate create: no id in response: ${JSON.stringify(data)}`);
  }
  return { taskId: data.id };
}

export async function getStatus(taskId: string): Promise<MusicStatus> {
  const res = await fetch(`${REPLICATE_BASE}/predictions/${taskId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate status ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    status: string;
    output?: string | string[] | null;
  };

  if (data.status === "succeeded") {
    const out = Array.isArray(data.output) ? data.output[0] : data.output;
    if (!out) return { status: "failed" };
    return { status: "complete", mp3Url: out };
  }
  if (data.status === "failed" || data.status === "canceled") {
    return { status: "failed" };
  }
  return { status: "pending" };
}

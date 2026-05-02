export interface SunoStatus {
  status: "pending" | "complete" | "failed";
  mp3Url?: string;
  title?: string;
}

function env() {
  const apiKey = process.env.SUNO_API_KEY;
  const base = process.env.SUNO_API_BASE ?? "https://api.sunoapi.org";
  if (!apiKey) throw new Error("SUNO_API_KEY is not set");
  return { apiKey, base };
}

export async function generate(prompt: string): Promise<{ taskId: string }> {
  const { apiKey, base } = env();
  const res = await fetch(`${base}/suno-api/generate-music`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: "V4.5",
      instrumental: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Suno generate ${res.status}: ${text}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const taskId =
    (data.taskId as string | undefined) ??
    (data.task_id as string | undefined) ??
    ((data.data as Record<string, unknown> | undefined)?.taskId as
      | string
      | undefined);
  if (!taskId) {
    throw new Error(`Suno generate: no taskId in response: ${JSON.stringify(data)}`);
  }
  return { taskId };
}

export async function getStatus(taskId: string): Promise<SunoStatus> {
  const { apiKey, base } = env();
  const res = await fetch(
    `${base}/suno-api/get-music-generation-details?taskId=${encodeURIComponent(taskId)}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Suno status ${res.status}: ${text}`);
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const data = (raw.data as Record<string, unknown> | undefined) ?? raw;
  const items = Array.isArray(data.items)
    ? (data.items as Array<Record<string, unknown>>)
    : Array.isArray(data.clips)
      ? (data.clips as Array<Record<string, unknown>>)
      : [];
  const first = items[0] ?? data;

  const rawStatus = String(
    first.status ?? data.status ?? raw.status ?? "pending"
  ).toLowerCase();

  const mp3Url =
    (first.audio_url as string | undefined) ??
    (first.audioUrl as string | undefined) ??
    (first.mp3_url as string | undefined) ??
    (first.url as string | undefined);

  const title =
    (first.title as string | undefined) ?? (data.title as string | undefined);

  let status: SunoStatus["status"] = "pending";
  if (["complete", "completed", "success", "succeeded", "streaming"].includes(rawStatus) && mp3Url) {
    status = "complete";
  } else if (["failed", "error"].includes(rawStatus)) {
    status = "failed";
  }

  return { status, mp3Url, title };
}

import { NextRequest } from "next/server";
import { buildAgentMessages, type SongInputs } from "@/lib/agent-prompt";
import { getSunoPrompt } from "@/lib/openrouter";
import { generate } from "@/lib/suno";

export const runtime = "nodejs";
export const maxDuration = 60;

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function parseInputs(body: unknown): SongInputs | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    !isString(b.driverName) ||
    !isString(b.grandPrix) ||
    !isString(b.celebration) ||
    !isString(b.team) ||
    !isString(b.persona)
  ) {
    return null;
  }
  return {
    driverName: b.driverName,
    grandPrix: b.grandPrix,
    celebration: b.celebration,
    team: b.team,
    persona: b.persona,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inputs = parseInputs(body);
  if (!inputs) {
    return Response.json(
      { error: "Missing required fields: driverName, grandPrix, celebration, team, persona" },
      { status: 400 }
    );
  }

  try {
    const messages = buildAgentMessages(inputs);
    const sunoPrompt = await getSunoPrompt(messages);
    const { taskId } = await generate(sunoPrompt);
    return Response.json({ jobId: taskId, sunoPrompt });
  } catch (err) {
    console.error("generate-song failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { teamOptions } from "@/app/f1/options";

export const runtime = "nodejs";

// Maps circuit IDs → Drums stem number (matches MUSICIAN_BRIEF_V2 ordering)
const CIRCUIT_STEM: Record<string, string> = {
  monaco:      "monaco",
  silverstone: "silverstone",
  spa:         "spa",
  suzuka:      "suzuka",
  monza:       "monza",
};

// Maps celebration IDs → filename segment
const CELEBRATION_STEM: Record<string, string> = {
  jump:     "jump",
  nod:      "nod",
  meltdown: "meltdown",
  frozen:   "frozen",
  tears:    "tears",
};

// Maps the 5 melody groups → filename segment
const MELODY_GROUP_STEM: Record<string, string> = {
  "red-bull": "red-bull",
  ferrari:    "ferrari",
  mclaren:    "mclaren",
  mercedes:   "mercedes",
  haas:       "haas",
};

function teamToMelodyGroup(teamId: string): string {
  const team = teamOptions.find((t) => t.id === teamId);
  return team?.melodyGroup ?? teamId;
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Missing body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (!isString(b.grandPrix) || !isString(b.celebration) || !isString(b.team)) {
    return Response.json(
      { error: "Missing required fields: grandPrix, celebration, team" },
      { status: 400 }
    );
  }

  const circuit     = CIRCUIT_STEM[b.grandPrix]     ?? b.grandPrix;
  const celebration = CELEBRATION_STEM[b.celebration] ?? b.celebration;
  const melodyGroup = MELODY_GROUP_STEM[teamToMelodyGroup(b.team)] ?? "red-bull";

  // Filename matches the placeholder-song generator convention.
  const filename = `${circuit}-${celebration}-${melodyGroup}.wav`;

  return Response.json({ songUrl: `/songs/${filename}` });
}

import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { createShare } from "@/lib/f1-share";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  try {
    let mp3: Buffer;
    let mp3Mime: string;

    if (b.mp3Url.startsWith("/")) {
      // Static file in /public — read from disk, no network round-trip.
      // Prevents SSL termination issues on Heroku where internal requests
      // arrive as plain HTTP but Node tries to open a TLS connection.
      const filePath = path.join(process.cwd(), "public", b.mp3Url);
      mp3 = await readFile(filePath);
      mp3Mime = b.mp3Url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
    } else {
      const mp3Res = await fetch(b.mp3Url);
      if (!mp3Res.ok) {
        return Response.json(
          { error: `Upstream fetch failed: ${mp3Res.status}` },
          { status: 502 }
        );
      }
      mp3 = Buffer.from(await mp3Res.arrayBuffer());
      mp3Mime = mp3Res.headers.get("content-type") ?? "audio/wav";
    }

    const code = await createShare({
      driverName: b.driverName,
      team: b.team,
      persona: b.persona,
      mp3,
      mp3Mime,
    });
    return Response.json({ code });
  } catch (err) {
    console.error("share create failed:", err);
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

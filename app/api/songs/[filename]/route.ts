import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import os from "os";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const BUCKET = "f1-cannes-songs";

function getStorage(): Storage {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonStr) {
    try {
      const tmpPath = path.join(os.tmpdir(), "gcp-sa.json");
      fs.writeFileSync(tmpPath, jsonStr);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    } catch {
      // fall through to ADC
    }
  }
  return new Storage();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // Only allow the expected file pattern — no path traversal
  if (!/^F1_Cannes_D\dB\dS\d_v\d+\.wav$/.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const storage = getStorage();
    const file = storage.bucket(BUCKET).file(filename);
    const [exists] = await file.exists();
    if (!exists) return new NextResponse("Not found", { status: 404 });

    const [buffer] = await file.download();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Song proxy error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

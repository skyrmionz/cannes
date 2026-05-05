export interface F1ShareData {
  driverName: string;
  team: string;
  persona: string;
  mp3Url: string;
}

export interface DecodedF1Share extends F1ShareData {
  timestamp: number;
}

// One-hour TTL on shared links.
const TTL_MS = 60 * 60 * 1000;

function toBase64Url(str: string): string {
  // Browser-safe base64 via btoa, with URL-safe substitutions.
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(unescape(encodeURIComponent(str)))
      : Buffer.from(str, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob !== "undefined") {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, "base64").toString("utf8");
}

export function encodeF1ShareData(data: F1ShareData): string {
  const payload = {
    driverName: data.driverName.slice(0, 50),
    team: data.team,
    persona: data.persona,
    mp3Url: data.mp3Url,
    t: Date.now(),
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeF1ShareData(encoded: string): DecodedF1Share | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as {
      driverName?: unknown;
      team?: unknown;
      persona?: unknown;
      mp3Url?: unknown;
      t?: unknown;
    };
    if (
      typeof parsed.driverName !== "string" ||
      typeof parsed.team !== "string" ||
      typeof parsed.persona !== "string" ||
      typeof parsed.mp3Url !== "string" ||
      typeof parsed.t !== "number"
    ) {
      return null;
    }
    return {
      driverName: parsed.driverName,
      team: parsed.team,
      persona: parsed.persona,
      mp3Url: parsed.mp3Url,
      timestamp: parsed.t,
    };
  } catch {
    return null;
  }
}

export function isShareExpired(timestamp: number): boolean {
  return Date.now() - timestamp > TTL_MS;
}

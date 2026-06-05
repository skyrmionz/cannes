// L'Oréal flow — 9 OOO statuses keyed off (sun × hydration). Agenda tail
// adds one closing sentence so all three answers visibly shape the result.

export type SunStop = 0 | 1 | 2;
export type HydrationLevel = 0 | 1 | 2;
export type AgendaIndex = 0 | 1 | 2 | 3;

export const LOREAL_RESULT_TTL_MS = 24 * 60 * 60 * 1000;

export interface LorealStatus {
  title: string;
  description: string;
  image: string;
}

// 3×3 matrix indexed as STATUS_MATRIX[sun][hydration].
// Rows = sun (0 Just a Peek → 2 Bake Me).
// Cols = hydration (0 Low → 2 Full).
const STATUS_MATRIX: ReadonlyArray<readonly [LorealStatus, LorealStatus, LorealStatus]> = [
  // Sun = Just a Peek
  [
    {
      title: "OOO Quiet mode. Full glow.",
      description:
        "Like a freshwater pearl, formed under pressure, unbothered at the surface. Your agents can handle the rest.",
      image: "/loreal/status-7-pearl.png",
    },
    {
      title: "OOO In the shade. Back when it counts.",
      description:
        "Like a fine bottle of wine, you know exactly when to surface. Your agents can handle the rest.",
      image: "/loreal/status-1-shade.png",
    },
    {
      title: "OOO Offline and timeless.",
      description:
        "Like a vintage photograph, cool spaces and good people are where will find you. Your agents can handle the rest.",
      image: "/loreal/status-2-offline.png",
    },
  ],
  // Sun = Healthy Dose
  [
    {
      title: "OOO Slow replies. Worth the wait.",
      description:
        "Like a drop of honey, everything moves better at your pace. Your agents can handle the rest.",
      image: "/loreal/status-5-honey.png",
    },
    {
      title: "OOO Sun, shade, perfectly calibrated.",
      description:
        "Like a deep-sea creature, you do your best work below the noise. Your agents can handle the rest.",
      image: "/loreal/status-3-deepsea.png",
    },
    {
      title: "OOO Tuned to every frequency.",
      description:
        "Like a radiant coral reef, you thrive in complexity and always find the balance. Your agents can handle the rest.",
      image: "/loreal/status-9-coral.png",
    },
  ],
  // Sun = Bake Me
  [
    {
      title: "OOO Gone with the breeze.",
      description:
        "Like a twinkling wind chime, you move with everything and miss nothing. Your agents can handle the rest.",
      image: "/loreal/status-8-windchime.png",
    },
    {
      title: "OOO Reflecting good energy only.",
      description:
        "Like a disco ball, the Cannes sun just makes you hit harder. Your agents can handle the rest.",
      image: "/loreal/status-6-disco.png",
    },
    {
      title: "OOO But fully operational.",
      description:
        "Like a solar paneled sweetheart, direct sun fuels everything you do. Your agents can handle the rest.",
      image: "/loreal/status-4-solar.png",
    },
  ],
];

// One short closer per agenda — appended to the description so the user's
// agenda answer is visibly reflected in the result without exploding the
// matrix to 36 cells.
const AGENDA_TAIL: Record<AgendaIndex, string> = {
  0: "Cannes Week is yours — pack accordingly.",
  1: "You picked your moments. The rest is noise.",
  2: "Wherever the breeze takes you, it'll be worth it.",
  3: "Your agents are running the booth — go enjoy France.",
};

export function getStatus(
  sun: SunStop,
  hydration: HydrationLevel,
  agenda: AgendaIndex,
): LorealStatus {
  const cell = STATUS_MATRIX[sun][hydration];
  const tail = AGENDA_TAIL[agenda];
  return {
    title: cell.title,
    description: `${cell.description} ${tail}`,
    image: cell.image,
  };
}

// Backwards-compatible alias for the old call sites that still import
// `getPersona`. Returns the same shape they used to consume.
export function getPersona(
  sun: SunStop,
  hydration: HydrationLevel,
  agenda: AgendaIndex,
): { name: string; description: string } {
  const s = getStatus(sun, hydration, agenda);
  return { name: s.title, description: s.description };
}

// 6-char alphanumeric (no ambiguous I/O/0/1) — easy to read off a phone screen.
export function generateResultCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface LorealResultPayload {
  persona: string;
  description: string;
  sun: SunStop;
  hydration: HydrationLevel;
  agenda: AgendaIndex;
  code: string;
}

export interface LorealResultDecoded extends LorealResultPayload {
  timestamp: number;
}

export function encodeLorealResult(p: LorealResultPayload): string {
  const data = { ...p, t: Date.now() };
  const json = JSON.stringify(data);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeLorealResult(encoded: string): LorealResultDecoded | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(base64, "base64").toString("utf8")
        : decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(json);
    return {
      persona: data.persona,
      description: data.description,
      sun: data.sun,
      hydration: data.hydration,
      agenda: data.agenda,
      code: data.code,
      timestamp: data.t,
    };
  } catch {
    return null;
  }
}

export function isLorealResultExpired(timestamp: number): boolean {
  return Date.now() - timestamp > LOREAL_RESULT_TTL_MS;
}

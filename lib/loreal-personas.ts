// L'Oréal flow — persona matrix + base64url encode/decode of the gift link
// payload. Persona is determined by (agenda × sun); hydration adds a tail
// flourish to the description so all 3 answers contribute without exploding
// the matrix to 36 entries.

export type SunStop = 0 | 1 | 2;
export type HydrationLevel = 0 | 1 | 2;
export type AgendaIndex = 0 | 1 | 2 | 3;

export const LOREAL_RESULT_TTL_MS = 24 * 60 * 60 * 1000;

interface PersonaCell {
  name: string;
  description: string;
}

// Rows = agenda (Packed, Curated, Spontaneous, Salesforce Forever).
// Cols = sun (Just a Peek, Healthy Dose, Bake Me).
const PERSONA_MATRIX: ReadonlyArray<readonly [PersonaCell, PersonaCell, PersonaCell]> = [
  // Packed
  [
    {
      name: "The Sharp Closer",
      description:
        "You're back-to-back, badge-on, espresso in hand, and skin that still reads camera-ready under conference lighting. The shade is the strategy.",
    },
    {
      name: "The Power Networker",
      description:
        "You move between the rooftop, the panel, and the after-party without breaking stride. A balanced glow signals you're playing the long game.",
    },
    {
      name: "The Sun-Soaked Operator",
      description:
        "Meetings on the terrace, calls on the beach — you let the sun catch up while the deals close themselves. SPF is a love language.",
    },
  ],
  // Curated
  [
    {
      name: "The Insider",
      description:
        "You don't chase the lineup, you set it. A barely-there bronze is the calling card of someone who already knows where the night ends.",
    },
    {
      name: "The Tastemaker",
      description:
        "Carefully chosen rooms, carefully chosen rosé, carefully chosen UV. Your skincare schedule is as curated as your dinner reservations.",
    },
    {
      name: "The Connoisseur",
      description:
        "You don't just attend Cannes — you collect it. The deep, intentional tan is a souvenir from someone who knows which lounge has the best light.",
    },
  ],
  // Spontaneous
  [
    {
      name: "The Quiet Romantic",
      description:
        "Last-minute boat invites, a book in your bag, sunsets you didn't plan but always seem to find. Your skin keeps it understated, just like you.",
    },
    {
      name: "The Free Spirit",
      description:
        "The schedule is a suggestion. You'll follow the music, the friends-of-friends, and the warm sea breeze wherever they lead — gleam fully intact.",
    },
    {
      name: "The Wildcard",
      description:
        "Cannes happened to you, and you happened right back. The sun-kissed look is the story; the stories are how you ended up on the yacht.",
    },
  ],
  // Salesforce Forever
  [
    {
      name: "The Booth Captain",
      description:
        "If anyone asks, you're at the booth. If no one asks, you're still at the booth. A protected, lit-from-within glow says you came to demo, not to bake.",
    },
    {
      name: "The Salesforce Believer",
      description:
        "Coffee, demos, networking lunches, and just enough Croisette sun to remember you're in France. You're here for the product and the product is here for you.",
    },
    {
      name: "The Cloud Native",
      description:
        "Equal parts panels and pool deck — you found the booth shade in front of the booth, and you're working on a perfect tan while a perfect deck builds itself.",
    },
  ],
];

const HYDRATION_TAIL: Record<HydrationLevel, string> = {
  0: "Skin tip from the L'Oréal labs: a hyaluronic serum tonight will undo today.",
  1: "A Vitamin-C boost in the morning will keep that glow on rotation.",
  2: "Stay this hydrated and your skin barrier will thank you all weekend.",
};

export function getPersona(
  sun: SunStop,
  hydration: HydrationLevel,
  agenda: AgendaIndex,
): { name: string; description: string } {
  const cell = PERSONA_MATRIX[agenda][sun];
  const tail = HYDRATION_TAIL[hydration];
  return {
    name: cell.name,
    description: `${cell.description} ${tail}`,
  };
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

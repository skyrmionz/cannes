// L'Oréal flow — 36 OOO personas keyed off the full (sun × hydration × agenda)
// matrix. Each persona has a matching vibe image and a downloadable SPF card.

export type SunStop = 0 | 1 | 2;
export type HydrationLevel = 0 | 1 | 2;
export type AgendaIndex = 0 | 1 | 2 | 3;

export const LOREAL_RESULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface LorealStatus {
  title: string;
  description: string;
  image: string;
  download: string;
}

// 3×3×4 matrix indexed as PERSONA_MATRIX[sun][hydration][agenda].
// Outer = sun (0 Just a Peek → 2 Bake Me).
// Middle = hydration (0 Low → 2 Full).
// Inner = agenda (0 Packed, 1 Curated, 2 Spontaneous, 3 Salesforce Forever).
export const PERSONA_MATRIX: ReadonlyArray<
  ReadonlyArray<ReadonlyArray<LorealStatus>>
> = [
  // Sun = 0 (Just a Peek / "1" in spec)
  [
    // Hydration = 0 ("1" in spec)
    [
      {
        title: "Unreachable on purpose",
        description:
          "I'm a deep-sea creature this week, aka as far away from the noise as possible.\n\nIf you need me, talk to my agent.",
        image: "/loreal/personas/111.png",
        download: "/loreal/personas/SPF-111.jpg",
      },
      {
        title: "Radiantly away",
        description:
          "Like a crystal decanter, my glass is always half full and I'm glowing in this light.\n\nMy agents can handle the hard stuff.",
        image: "/loreal/personas/112.png",
        download: "/loreal/personas/SPF-112.jpg",
      },
      {
        title: "No agenda. No regrets.",
        description:
          "Like a glass fishing float, I drift exactly where the current takes me and end up somewhere random.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/113.png",
        download: "/loreal/personas/SPF-113.jpg",
      },
      {
        title: "Cool and unhurried",
        description:
          "Like a smooth stone, I'm busy being beautiful in the shade.\n\nI'm pretty hard to spot, so let my agent handle the busy",
        image: "/loreal/personas/114.png",
        download: "/loreal/personas/SPF-114.jpg",
      },
    ],
    // Hydration = 1 ("2" in spec)
    [
      {
        title: "Tell the sun I'm OOO",
        description:
          "They call me a silk parasol because I'm finding every shady spot I can out here.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/121.png",
        download: "/loreal/personas/SPF-121.jpg",
      },
      {
        title: "In the shade.\nBack when it counts.",
        description:
          "Like a fine bottle of wine, you know exactly when to surface.\n\nYour agents can handle the rest.",
        image: "/loreal/personas/122.png",
        download: "/loreal/personas/SPF-122.jpg",
      },
      {
        title: "Roaming everywhere",
        description:
          "Like sea glass, the travel is bringing out the best in me. There's so much to do on La Croisette and I'm seeing it all.\n\nMy agents are handling the rest.",
        image: "/loreal/personas/123.png",
        download: "/loreal/personas/SPF-123.jpg",
      },
      {
        title: "Moving here",
        description:
          "Everything I need is on this beach and there's no reason to repack. I'm a vintage suitcase, baby.\n\nIf you need something handled somewhere else, talk to my agent.",
        image: "/loreal/personas/124.png",
        download: "/loreal/personas/SPF-124.jpg",
      },
    ],
    // Hydration = 2 ("3" in spec)
    [
      {
        title: "Moving here",
        description:
          "Like a message in a bottle, the right people know where to find me. You know who you are.\n\nEveryone else, my agent will be in touch.",
        image: "/loreal/personas/131.png",
        download: "/loreal/personas/SPF-131.jpg",
      },
      {
        title: "Busy being beautiful",
        description:
          "I'm a white gardenia at Cannes. My standards are high, my agenda is curated, and I look and smell fantastic.\n\nIf you need me, talk to my agent.",
        image: "/loreal/personas/132.png",
        download: "/loreal/personas/SPF-132.jpg",
      },
      {
        title: "Called to the ocean",
        description:
          "Like an iridescent conch shell, try to reach me and you'll reach the ocean instead. I'm never leaving this beach.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/133.png",
        download: "/loreal/personas/SPF-133.jpg",
      },
      {
        title: "Glowing hard",
        description:
          "Like a freshwater pearl, I thrive under pressure and in this sunlight. Cannes was made for me.\n\nThe busy work was made for my agents.",
        image: "/loreal/personas/134.png",
        download: "/loreal/personas/SPF-134.jpg",
      },
    ],
  ],
  // Sun = 1 (Healthy Dose / "2" in spec)
  [
    // Hydration = 0 ("1" in spec)
    [
      {
        title: "Sweaty and thriving",
        description:
          "Like a cactus in bloom, I'm turning these sunny conditions into something spectacular.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/211.png",
        download: "/loreal/personas/SPF-211.jpg",
      },
      {
        title: "Slow replies. Worth the wait.",
        description:
          "Like a drop of honey, I'm moving slower and sweeter at my OOO pace.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/212.png",
        download: "/loreal/personas/SPF-212.jpg",
      },
      {
        title: "Arms wide open",
        description:
          "Like a starfish, I'm open to everything and finding the best spots on the beach.\n\nIf you have a work-related question, ask my agent.",
        image: "/loreal/personas/213.png",
        download: "/loreal/personas/SPF-213.jpg",
      },
      {
        title: "Made for this season",
        description:
          "Like a ripe little fig, everything about this moment is exactly right. I was born for Cannes.\n\nMy agents can handle everything else.",
        image: "/loreal/personas/214.png",
        download: "/loreal/personas/SPF-214.jpg",
      },
    ],
    // Hydration = 1 ("2" in spec)
    [
      {
        title: "All in. Every time.",
        description:
          "Like a stack of gold bangles that keeps getting better, I'm saying yes to everything on La Croisette.\n\nFor busy work inquiries, talk to my agent.",
        image: "/loreal/personas/221.png",
        download: "/loreal/personas/SPF-221.jpg",
      },
      {
        title: "Carrying the team",
        description:
          "Like a brass compass, I'm showing up to every pop up event with class. Come to me for direction, not busy work.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/222.png",
        download: "/loreal/personas/SPF-222.jpg",
      },
      {
        title: "Gone with the breeze",
        description:
          "Like a twinkling wind chime, I'm working outside and waiting for the breeze to come.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/223.png",
        download: "/loreal/personas/SPF-223.jpg",
      },
      {
        title: "Sun-curious",
        description:
          "Like a radiant coral reef, I'm into this sun but still cautious about it.\n\nWhile I find the balance at Cannes, my agents are handling the rest.",
        image: "/loreal/personas/224.png",
        download: "/loreal/personas/SPF-224.jpg",
      },
    ],
    // Hydration = 2 ("3" in spec)
    [
      {
        title: "Booked and hydrated",
        description:
          "Like a champagne tower, I've got plans tonight and the night after that. Things are flowing nicely out here.\n\nIf you need me, talk to my agent.",
        image: "/loreal/personas/231.png",
        download: "/loreal/personas/SPF-231.jpg",
      },
      {
        title: "Full of color",
        description:
          "Like a prism, I'm taking in all the light and exuding more than one color. Brb, applying SPF before my next party.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/232.png",
        download: "/loreal/personas/SPF-232.jpg",
      },
      {
        title: "Hot and unmissable",
        description:
          "Everyone stops and stares when I show up. I'm a glowing lantern on La Croisette.\n\nMy agents can handle the busy work.",
        image: "/loreal/personas/233.png",
        download: "/loreal/personas/SPF-233.jpg",
      },
      {
        title: "Happy inside",
        description:
          "Like a crystal geode, everything remarkable happens inside, not outside in the sun.\n\nFind me in the shade at Cannes, or let my agent handle it.",
        image: "/loreal/personas/234.png",
        download: "/loreal/personas/SPF-234.jpg",
      },
    ],
  ],
  // Sun = 2 (Bake Me / "3" in spec)
  [
    // Hydration = 0 ("1" in spec)
    [
      {
        title: "Sun-drenched, not sorry",
        description:
          "Call me a sundial: I only play when conditions are exactly right, and right now they are.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/311.png",
        download: "/loreal/personas/SPF-311.jpg",
      },
      {
        title: "Focused on the sun",
        description:
          "Let's focus on what matters: finding the sunniest spots. I'm a golden magnifying glass out here.\n\nIf you need something, talk to my agent.",
        image: "/loreal/personas/312.png",
        download: "/loreal/personas/SPF-312.jpg",
      },
      {
        title: "Catching every ray",
        description:
          "Like a golden pinwheel, the more sun I get, the more I spiral. Looking for sunscreen asap.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/313.png",
        download: "/loreal/personas/SPF-313.jpg",
      },
      {
        title: "Facing the sun",
        description:
          "Like a sunflower, I'm turning toward the light and staying there until I'm told to leave.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/314.png",
        download: "/loreal/personas/SPF-314.jpg",
      },
    ],
    // Hydration = 1 ("2" in spec)
    [
      {
        title: "Bright and zesty",
        description:
          "Like a golden pineapple, I'm tropical at heart and happiest in the sun. Everything else at Cannes is just an added bonus.\n\nIf you need me, call my agent.",
        image: "/loreal/personas/321.png",
        download: "/loreal/personas/SPF-321.jpg",
      },
      {
        title: "Winning at life",
        description:
          "Like a laurel wreath, not just anyone can triumph at Cannes. Happy to report I'm thriving in this heat.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/322.png",
        download: "/loreal/personas/SPF-322.jpg",
      },
      {
        title: "Party seeker",
        description:
          "Didn't you know I'm a disco ball delight? The Cannes sun is bringing out the best in me.\n\nPlus, I have my agents handling the busy work.",
        image: "/loreal/personas/323.png",
        download: "/loreal/personas/SPF-323.jpg",
      },
      {
        title: "Fully operational",
        description:
          "Like a solar-paneled sweetheart, this direct sun is fueling my greatest work. I can feel it.\n\nMy agents are handling all indoor matters.",
        image: "/loreal/personas/324.png",
        download: "/loreal/personas/SPF-324.jpg",
      },
    ],
    // Hydration = 2 ("3" in spec)
    [
      {
        title: "100% regal",
        description:
          "Like a golden crown, I could live forever in these conditions, and the people know it. Cannes is the best.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/331.png",
        download: "/loreal/personas/SPF-331.jpg",
      },
      {
        title: "Offline and timeless",
        description:
          "Like a vintage photograph, find me in cool spaces with quality people.\n\nMy agent's got me covered.",
        image: "/loreal/personas/332.png",
        download: "/loreal/personas/SPF-332.jpg",
      },
      {
        title: "First to arrive, last to leave",
        description:
          "Like a golden hourglass, I'm filling every minute with something special out here.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/333.png",
        download: "/loreal/personas/SPF-333.jpg",
      },
      {
        title: "Not built for this",
        description:
          "Like a snow globe, why would you bring me outside? In search of shade and sunscreen.\n\nMy agents can handle the rest.",
        image: "/loreal/personas/334.png",
        download: "/loreal/personas/SPF-334.jpg",
      },
    ],
  ],
];

export function getStatus(
  sun: SunStop,
  hydration: HydrationLevel,
  agenda: AgendaIndex,
): LorealStatus {
  return PERSONA_MATRIX[sun][hydration][agenda];
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

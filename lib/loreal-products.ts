export interface LorealProduct {
  id: string;
  name: string;
  line: string;
  category: "cleanser" | "moisturizer" | "serum" | "sunscreen";
  description: string;
  skinTypes: string[];
  routines: string[];
}

const products: LorealProduct[] = [
  // Cleansers
  {
    id: "revitalift-cleanser",
    name: "Revitalift Derm Intensives Gel Cleanser",
    line: "Revitalift",
    category: "cleanser",
    description: "3.5% Pure Glycolic Acid gel cleanser for brighter, smoother skin",
    skinTypes: ["oily", "combination"],
    routines: ["moderate", "meticulous"],
  },
  {
    id: "pure-clay-cleanser",
    name: "Pure-Clay Purify & Mattify Cleanser",
    line: "Pure-Clay",
    category: "cleanser",
    description: "3 Pure Clays + Eucalyptus to draw out impurities",
    skinTypes: ["oily", "combination"],
    routines: ["quick", "light"],
  },
  {
    id: "hydrafresh-cleanser",
    name: "HydraFresh Anti-Ox Grape Seed Cleanser",
    line: "HydraFresh",
    category: "cleanser",
    description: "Antioxidant-enriched formula that gently purifies",
    skinTypes: ["dry", "sensitive"],
    routines: ["quick", "light"],
  },
  {
    id: "age-perfect-cleanser",
    name: "Age Perfect Nourishing Cream Cleanser",
    line: "Age Perfect",
    category: "cleanser",
    description: "Rich cream cleanser that melts away makeup without stripping",
    skinTypes: ["dry", "sensitive"],
    routines: ["moderate", "meticulous"],
  },

  // Moisturizers
  {
    id: "revitalift-moisturizer",
    name: "Revitalift Triple Power Anti-Aging Moisturizer",
    line: "Revitalift",
    category: "moisturizer",
    description: "Pro-Retinol, Vitamin C & Hyaluronic Acid in one formula",
    skinTypes: ["combination", "dry"],
    routines: ["moderate", "meticulous"],
  },
  {
    id: "hydrafresh-moisturizer",
    name: "HydraFresh Aqua Essence Moisturizer",
    line: "HydraFresh",
    category: "moisturizer",
    description: "Lightweight water-burst hydration for dewy skin",
    skinTypes: ["oily", "combination"],
    routines: ["quick", "light"],
  },
  {
    id: "age-perfect-moisturizer",
    name: "Age Perfect Cell Renewal Night Cream",
    line: "Age Perfect",
    category: "moisturizer",
    description: "LHA & antioxidants accelerate surface cell renewal overnight",
    skinTypes: ["dry", "sensitive"],
    routines: ["moderate", "meticulous"],
  },
  {
    id: "collagen-moisturizer",
    name: "Collagen Moisture Filler Daily Moisturizer",
    line: "Revitalift",
    category: "moisturizer",
    description: "Lightweight collagen and beeswax formula for plumper skin",
    skinTypes: ["oily", "sensitive"],
    routines: ["quick", "light"],
  },

  // Serums
  {
    id: "revitalift-serum",
    name: "Revitalift 1.5% Pure Hyaluronic Acid Serum",
    line: "Revitalift",
    category: "serum",
    description: "Intensely hydrates and replumps skin in just 1 week",
    skinTypes: ["dry", "sensitive", "combination"],
    routines: ["light", "moderate", "meticulous"],
  },
  {
    id: "glycolic-serum",
    name: "Revitalift 10% Pure Glycolic Acid Serum",
    line: "Revitalift",
    category: "serum",
    description: "Even skin tone and visibly reduce dark spots",
    skinTypes: ["oily", "combination"],
    routines: ["moderate", "meticulous"],
  },
  {
    id: "vitamin-c-serum",
    name: "Revitalift 12% Pure Vitamin C Serum",
    line: "Revitalift",
    category: "serum",
    description: "Brighter, more radiant skin with clinical-grade Vitamin C",
    skinTypes: ["oily", "dry", "combination", "sensitive"],
    routines: ["light", "moderate"],
  },
  {
    id: "retinol-serum",
    name: "Revitalift Derm Intensives Night Serum with Retinol",
    line: "Revitalift",
    category: "serum",
    description: "0.3% Pure Retinol visibly reduces deep wrinkles",
    skinTypes: ["dry", "combination"],
    routines: ["meticulous"],
  },

  // Sunscreens
  {
    id: "uv-perfect-spf50",
    name: "UV Perfect Aqua Essence SPF 50+",
    line: "UV Perfect",
    category: "sunscreen",
    description: "Ultra-lightweight aqua texture with advanced UV protection",
    skinTypes: ["oily", "combination"],
    routines: ["quick", "light", "moderate", "meticulous"],
  },
  {
    id: "revitalift-spf",
    name: "Revitalift Triple Power Day Lotion SPF 30",
    line: "Revitalift",
    category: "sunscreen",
    description: "Anti-aging moisturizer with broad spectrum SPF 30",
    skinTypes: ["dry", "combination"],
    routines: ["quick", "moderate"],
  },
  {
    id: "uv-defender-spf",
    name: "UV Defender Bright & Clear SPF 50+",
    line: "UV Defender",
    category: "sunscreen",
    description: "Niacinamide-infused sunscreen that corrects dark spots",
    skinTypes: ["oily", "sensitive"],
    routines: ["light", "moderate", "meticulous"],
  },
  {
    id: "age-perfect-spf",
    name: "Age Perfect Collagen Expert SPF 30",
    line: "Age Perfect",
    category: "sunscreen",
    description: "Firming collagen peptides with daily UV defense",
    skinTypes: ["dry", "sensitive"],
    routines: ["moderate", "meticulous"],
  },
];

export function getRecommendations(
  skinRoutine: string,
  skinType: string,
  preferredProduct: string
): LorealProduct[] {
  const categories: LorealProduct["category"][] = [
    "cleanser",
    "moisturizer",
    "serum",
    "sunscreen",
  ];

  const result: LorealProduct[] = [];
  const usedIds = new Set<string>();

  for (const category of categories) {
    const pool = products.filter((p) => p.category === category && !usedIds.has(p.id));

    const bestMatch = pool.find(
      (p) => p.skinTypes.includes(skinType) && p.routines.includes(skinRoutine)
    );
    const skinMatch = pool.find((p) => p.skinTypes.includes(skinType));
    const pick = bestMatch ?? skinMatch ?? pool[0];

    if (pick) {
      result.push(pick);
      usedIds.add(pick.id);
    }
  }

  // Reorder so the user's preferred category appears first
  const preferredIdx = result.findIndex((p) => p.category === preferredProduct);
  if (preferredIdx > 0) {
    const [item] = result.splice(preferredIdx, 1);
    result.unshift(item);
  }

  return result;
}

export function generateResultCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function encodeResultData(data: {
  name: string;
  skinRoutine: string;
  skinType: string;
  preferredProduct: string;
  code: string;
}): string {
  const payload = {
    ...data,
    name: data.name.slice(0, 50),
    t: Date.now(),
  };
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export interface DecodedResult {
  name: string;
  skinRoutine: string;
  skinType: string;
  preferredProduct: string;
  code: string;
  timestamp: number;
}

export function decodeResultData(encoded: string): DecodedResult | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const data = JSON.parse(json);
    return {
      name: data.name,
      skinRoutine: data.skinRoutine,
      skinType: data.skinType,
      preferredProduct: data.preferredProduct,
      code: data.code,
      timestamp: data.t,
    };
  } catch {
    return null;
  }
}

export function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > 30 * 60 * 1000;
}

export interface KnobOption {
  id: string;
  label: string;
  subtitle?: string;
  description: string;
  image?: string;
  emoji?: string;
  logo?: string;
  drivers?: string;
  character?: boolean;
  melodyGroup?: string;
  musicNote?: string;
}

// Driving style → circuit ID mapping.
// D1=monza, D2=monaco, D3=spa, D4=silverstone, D5=suzuka
// These IDs must match CIRCUIT_TO_D in loading-screen.tsx.
export const drivingStyleOptions: KnobOption[] = [
  {
    id: "monza",
    label: "Race Circuit",
    subtitle: "Full throttle",
    description: "Flat-out speed, zero compromise. The throttle is wide open from lights to flag.",
    musicNote: "Relentless double-kick pattern — flat-out Italian disco-rock energy",
    image: "/f1/circuits/photos/italian.png",
    emoji: "🏁",
  },
  {
    id: "monaco",
    label: "Street Circuit",
    subtitle: "Precision on the limit",
    description: "Millimetres from the barrier, every corner demands perfection.",
    musicNote: "Crisp precision rock kit — every hit locked to the grid",
    image: "/f1/circuits/photos/monaco.jpg",
    emoji: "🏙️",
  },
  {
    id: "spa",
    label: "Mixed Circuit",
    subtitle: "Anything can happen",
    description: "High-speed and technical, sunshine and storms. Spa keeps everyone guessing.",
    musicNote: "Driving acoustic rock kit with thunderous floor-tom fills",
    image: "/f1/circuits/photos/spa.jpg",
    emoji: "⛈️",
  },
  {
    id: "silverstone",
    label: "Home Circuit",
    subtitle: "Fast and flowing",
    description: "The birthplace of Formula 1 — sweeping high-speed corners, a crowd that lives for it.",
    musicNote: "Rolling groove with wide snare crack — open, powerful, euphoric",
    image: "/f1/circuits/photos/british.jpg",
    emoji: "🇬🇧",
  },
  {
    id: "suzuka",
    label: "Technical Circuit",
    subtitle: "Chess at 300 km/h",
    description: "The figure-of-eight challenge — a driver's circuit where finesse beats horsepower.",
    musicNote: "Tight hi-hat shuffle with syncopated kick — intricate and surgical",
    image: "/f1/circuits/photos/suzuka.jpg",
    emoji: "🎌",
  },
];

// Kept as alias — some screens still reference grandPrixOptions.
export const grandPrixOptions = drivingStyleOptions;

export const celebrations: KnobOption[] = [
  {
    id: "jump",
    label: "Jump and Cheer",
    subtitle: "Pure adrenaline",
    description: "",
    musicNote: "Driving punchy synth bass with aggressive 16th-note runs",
    image: "/f1/emoji/raising-hands.png",
  },
  {
    id: "nod",
    label: "Nod and Smile",
    subtitle: "Cool and collected",
    description: "",
    musicNote: "Smooth fretless bass — restrained groove with subtle ghost notes",
    image: "/f1/emoji/smirk.png",
  },
  {
    id: "meltdown",
    label: "Total Meltdown",
    subtitle: "Raw emotion",
    description: "",
    musicNote: "Heavy overdriven bass — pounding 8th-notes, sub-bass you feel physically",
    image: "/f1/emoji/exploding-head.png",
  },
  {
    id: "frozen",
    label: "Frozen in Disbelief",
    subtitle: "Silent awe",
    description: "",
    musicNote: "Sparse held bass notes — slow movement, space, tension",
    emoji: "🥶",
  },
  {
    id: "tears",
    label: "Cry Happy Tears",
    subtitle: "Pure joy",
    description: "",
    musicNote: "Deep warm swelling bass — melodic and emotional, pure legato",
    emoji: "😭",
  },
];

// 5 teams — one per snare/melody stem. melodyGroup === id, maps directly to S1–S5.
const MELODY_NOTES: Record<string, string> = {
  "red-bull": "Bold brass fanfare with tuba foundation — commanding and authoritative",
  "ferrari":  "Italian opera brass led by high trumpet and trombone — passionate and melodic",
  "mclaren":  "Soaring orchestral brass with grand piano — triumphant and cinematic",
  "mercedes": "Precision orchestral brass with string quartet — engineered elegance",
  "haas":     "Wildcard melody — unconventional, distinctive, unforgettable",
};

export const teamOptions: KnobOption[] = [
  { id: "red-bull",  melodyGroup: "red-bull",  musicNote: MELODY_NOTES["red-bull"],  label: "Red Bull Racing", description: "Four-time constructors' champions — relentless innovation, dominant pace.",  image: "/f1/teams/cars/red-bull.png",  logo: "/f1/teams/logos/red-bull.png",  drivers: "Verstappen & Lawson" },
  { id: "ferrari",   melodyGroup: "ferrari",   musicNote: MELODY_NOTES["ferrari"],   label: "Ferrari",         description: "The most iconic name in motorsport — passion, drama, legacy.",                image: "/f1/teams/cars/ferrari.png",   logo: "/f1/teams/logos/ferrari.png",   drivers: "Leclerc & Hamilton" },
  { id: "mclaren",   melodyGroup: "mclaren",   musicNote: MELODY_NOTES["mclaren"],   label: "McLaren",         description: "One of F1's most storied teams — a winning tradition reborn.",                image: "/f1/teams/cars/mclaren.png",   logo: "/f1/teams/logos/mclaren.png",   drivers: "Norris & Piastri" },
  { id: "mercedes",  melodyGroup: "mercedes",  musicNote: MELODY_NOTES["mercedes"],  label: "Mercedes",        description: "Eight consecutive constructors' titles — engineering excellence defined.",    image: "/f1/teams/cars/mercedes.png",  logo: "/f1/teams/logos/mercedes.png",  drivers: "Russell & Antonelli" },
  { id: "haas",      melodyGroup: "haas",      musicNote: MELODY_NOTES["haas"],      label: "Haas",            description: "America's F1 team — grit, determination, and a growing grid presence.",     image: "/f1/teams/cars/haas.png",      logo: "/f1/teams/logos/haas.png",      drivers: "Ocon & Bearman" },
];

// Used only for randomly assigning the podium pixel character — not shown as a question.
export const personaOptions: KnobOption[] = [
  { id: "pole-position-networker", label: "The Pole Position Networker", description: "First to every conversation, business cards flying before the lights go out.", character: true },
  { id: "qualifying-lap",          label: "Qualifying Lap",              description: "Warming up with small talk, saving the big pitch for when it counts.", character: true },
  { id: "slow-puncture",           label: "The Slow Puncture",           description: "Started strong, now quietly deflating at the back of the after-party.", character: true },
  { id: "safety-car",              label: "The Safety Car",              description: "Keeps the group together, controls the pace, nobody passes without permission.", character: true },
  { id: "backmarker",              label: "The Backmarker",              description: "Arrived late, missed the keynote, still having a great time in the lobby.", character: true },
  { id: "unbothered",              label: "Unbothered",                  description: "Sunglasses on, lanyard hidden, radiating main-character energy from the corner.", character: true },
  { id: "retired-champion",        label: "The Retired Champion",        description: "Been coming to Cannes for years, has nothing left to prove, here for the rosé.", character: true },
  { id: "pit-lane-regular",        label: "The Pit Lane Regular",        description: "Always at the bar, knows every bartender, networking happens between rounds.", character: true },
  { id: "drs-zone",                label: "The DRS Zone",                description: "Finds the opening, closes the gap, seals the deal before anyone else reacts.", character: true },
  { id: "undercut",                label: "The Undercut",                description: "Slips into conversations early, steals the connection before you even noticed.", character: true },
  { id: "blown-diffuser",          label: "The Blown Diffuser",          description: "Loud entrance, chaotic energy, leaves everyone wondering what just happened.", character: true },
  { id: "flying-lap",              label: "The Flying Lap",              description: "Maximum intensity, zero wasted time, every meeting is a personal best.", character: true },
];


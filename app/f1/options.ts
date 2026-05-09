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

export const grandPrixOptions: KnobOption[] = [
  {
    id: "spa",
    label: "Spa-Francorchamps",
    subtitle: "Belgium",
    description: "Sweeping elevation changes through the Ardennes forest — raw, dramatic, unpredictable.",
    musicNote: "Driving acoustic rock kit with thunderous floor-tom fills",
    image: "/f1/circuits/photos/spa.jpg",
  },
  {
    id: "suzuka",
    label: "Suzuka",
    subtitle: "Japan",
    description: "A figure-of-eight crossover masterpiece — technical, flowing, relentless.",
    musicNote: "Tight electronic kit with intricate syncopated hi-hats",
    image: "/f1/circuits/photos/suzuka.jpg",
  },
  {
    id: "monaco",
    label: "Monaco",
    subtitle: "Monaco",
    description: "Precision and prestige through the streets of Monte Carlo — unforgiving, iconic.",
    musicNote: "Crisp precision rock kit — every hit locked to the grid",
    image: "/f1/circuits/photos/monaco.jpg",
  },
  {
    id: "silverstone",
    label: "Silverstone",
    subtitle: "United Kingdom",
    description: "High-speed corners and rich heritage — the birthplace of Formula 1.",
    musicNote: "Classic British rock kit with open hi-hats and live cymbal work",
    image: "/f1/circuits/photos/british.jpg",
  },
  {
    id: "monza",
    label: "Monza",
    subtitle: "Italy",
    description: "The Temple of Speed — flat-out, intense, electric atmosphere.",
    musicNote: "Relentless double-kick pattern — flat-out Italian disco-rock energy",
    image: "/f1/circuits/photos/italian.png",
  },
];

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

// Full team list for display — each carries a melodyGroup that maps to
// one of the 5 Melody stems (and the pre-rendered song filename).
const MELODY_NOTES: Record<string, string> = {
  "red-bull": "Bold brass fanfare with tuba foundation — commanding and authoritative",
  "ferrari":  "Italian opera brass led by high trumpet and trombone — passionate and melodic",
  "mclaren":  "Soaring orchestral brass with grand piano — triumphant and cinematic",
  "mercedes": "Precision orchestral brass with string quartet — engineered elegance",
  "haas":     "Wildcard melody — unconventional, distinctive, unforgettable",
};

export const teamOptions: KnobOption[] = [
  { id: "red-bull",     melodyGroup: "red-bull",  musicNote: MELODY_NOTES["red-bull"],  label: "Red Bull Racing",  description: "Four-time constructors' champions — relentless innovation, dominant pace.",            image: "/f1/teams/cars/red-bull.png",      logo: "/f1/teams/logos/red-bull.png",      drivers: "Max Verstappen & Liam Lawson" },
  { id: "racing-bulls", melodyGroup: "red-bull",  musicNote: MELODY_NOTES["red-bull"],  label: "Racing Bulls",     description: "The proving ground for Red Bull's next generation — raw talent, rapid development.", image: "/f1/teams/cars/racing-bulls.png",  logo: "/f1/teams/logos/racing-bulls.png",  drivers: "Yuki Tsunoda & Isack Hadjar" },
  { id: "ferrari",      melodyGroup: "ferrari",   musicNote: MELODY_NOTES["ferrari"],   label: "Ferrari",          description: "The most iconic name in motorsport — passion, drama, legacy.",                        image: "/f1/teams/cars/ferrari.png",       logo: "/f1/teams/logos/ferrari.png",       drivers: "Charles Leclerc & Lewis Hamilton" },
  { id: "mclaren",      melodyGroup: "mclaren",   musicNote: MELODY_NOTES["mclaren"],   label: "McLaren",          description: "One of F1's most storied teams — a winning tradition reborn.",                        image: "/f1/teams/cars/mclaren.png",       logo: "/f1/teams/logos/mclaren.png",       drivers: "Lando Norris & Oscar Piastri" },
  { id: "williams",     melodyGroup: "mclaren",   musicNote: MELODY_NOTES["mclaren"],   label: "Williams",         description: "Nine constructors' championships — a legendary name fighting back.",                  image: "/f1/teams/cars/williams.png",      logo: "/f1/teams/logos/williams.png",      drivers: "Carlos Sainz & Alex Albon" },
  { id: "mercedes",     melodyGroup: "mercedes",  musicNote: MELODY_NOTES["mercedes"],  label: "Mercedes",         description: "Eight consecutive constructors' titles — engineering excellence defined.",            image: "/f1/teams/cars/mercedes.png",      logo: "/f1/teams/logos/mercedes.png",      drivers: "George Russell & Kimi Antonelli" },
  { id: "audi",         melodyGroup: "mercedes",  musicNote: MELODY_NOTES["mercedes"],  label: "Audi",             description: "A new era begins — German engineering enters Formula 1.",                            image: "/f1/teams/cars/audi.png",          logo: "/f1/teams/logos/audi.png",          drivers: "Nico Hülkenberg & Gabriel Bortoleto" },
  { id: "aston-martin", melodyGroup: "haas",      musicNote: MELODY_NOTES["haas"],      label: "Aston Martin",     description: "British racing green ambition — building a dynasty from the ground up.",             image: "/f1/teams/cars/aston-martin.png",  logo: "/f1/teams/logos/aston-martin.png",  drivers: "Fernando Alonso & Lance Stroll" },
  { id: "alpine",       melodyGroup: "haas",      musicNote: MELODY_NOTES["haas"],      label: "Alpine",           description: "French flair meets racing pedigree — the spirit of Renault reborn.",                 image: "/f1/teams/cars/alpine.png",        logo: "/f1/teams/logos/alpine.png",        drivers: "Pierre Gasly & Jack Doohan" },
  { id: "haas",         melodyGroup: "haas",      musicNote: MELODY_NOTES["haas"],      label: "Haas",             description: "America's F1 team — grit, determination, and a growing presence.",                  image: "/f1/teams/cars/haas.png",          logo: "/f1/teams/logos/haas.png",          drivers: "Esteban Ocon & Oliver Bearman" },
  { id: "cadillac",     melodyGroup: "haas",      musicNote: MELODY_NOTES["haas"],      label: "Cadillac",         description: "The newest entry on the grid — American ambition at full throttle.",                 image: "/f1/teams/cars/cadillac.png",      logo: "/f1/teams/logos/cadillac.png",      drivers: "TBA" },
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


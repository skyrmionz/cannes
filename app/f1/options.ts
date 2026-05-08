export interface KnobOption {
  id: string;
  label: string;
  subtitle?: string;
  description: string;
  image?: string;
  logo?: string;
  drivers?: string;
  character?: boolean;
}

export const grandPrixOptions: KnobOption[] = [
  {
    id: "spa",
    label: "Spa-Francorchamps",
    subtitle: "Belgium",
    description:
      "Sweeping elevation changes through the Ardennes forest — raw, dramatic, unpredictable.",
    image: "/f1/circuits/photos/spa.jpg",
  },
  {
    id: "suzuka",
    label: "Suzuka",
    subtitle: "Japan",
    description:
      "A figure-of-eight crossover masterpiece — technical, flowing, relentless.",
    image: "/f1/circuits/photos/suzuka.jpg",
  },
  {
    id: "monaco",
    label: "Monaco",
    subtitle: "Monaco",
    description:
      "Precision and prestige through the streets of Monte Carlo — unforgiving, iconic.",
    image: "/f1/circuits/photos/monaco.jpg",
  },
  {
    id: "silverstone",
    label: "Silverstone",
    subtitle: "United Kingdom",
    description:
      "High-speed corners and rich heritage — the birthplace of Formula 1.",
    image: "/f1/circuits/photos/british.jpg",
  },
  {
    id: "monza",
    label: "Monza",
    subtitle: "Italy",
    description:
      "The Temple of Speed — flat-out, intense, electric atmosphere.",
    image: "/f1/circuits/photos/italian.png",
  },
];

export const celebrations: KnobOption[] = [
  {
    id: "jump",
    label: "Jump and Cheer",
    subtitle: "Pure adrenaline",
    description: "",
    image: "/f1/emoji/raising-hands.png",
  },
  {
    id: "nod",
    label: "Nod and Smile",
    subtitle: "Cool and collected",
    description: "",
    image: "/f1/emoji/smirk.png",
  },
  {
    id: "meltdown",
    label: "Total Meltdown",
    subtitle: "Raw emotion",
    description: "",
    image: "/f1/emoji/exploding-head.png",
  },
];

export const teamOptions: KnobOption[] = [
  { id: "racing-bulls", label: "Racing Bulls", description: "The proving ground for Red Bull's next generation — raw talent, rapid development.", image: "/f1/teams/cars/racing-bulls.png", logo: "/f1/teams/logos/racing-bulls.png", drivers: "Yuki Tsunoda & Isack Hadjar" },
  { id: "red-bull", label: "Red Bull Racing", description: "Four-time constructors' champions — relentless innovation, dominant pace.", image: "/f1/teams/cars/red-bull.png", logo: "/f1/teams/logos/red-bull.png", drivers: "Max Verstappen & Liam Lawson" },
  { id: "mclaren", label: "McLaren", description: "One of F1's most storied teams — a winning tradition reborn.", image: "/f1/teams/cars/mclaren.png", logo: "/f1/teams/logos/mclaren.png", drivers: "Lando Norris & Oscar Piastri" },
  { id: "ferrari", label: "Ferrari", description: "The most iconic name in motorsport — passion, drama, legacy.", image: "/f1/teams/cars/ferrari.png", logo: "/f1/teams/logos/ferrari.png", drivers: "Charles Leclerc & Lewis Hamilton" },
  { id: "mercedes", label: "Mercedes", description: "Eight consecutive constructors' titles — engineering excellence defined.", image: "/f1/teams/cars/mercedes.png", logo: "/f1/teams/logos/mercedes.png", drivers: "George Russell & Kimi Antonelli" },
  { id: "aston-martin", label: "Aston Martin", description: "British racing green ambition — building a dynasty from the ground up.", image: "/f1/teams/cars/aston-martin.png", logo: "/f1/teams/logos/aston-martin.png", drivers: "Fernando Alonso & Lance Stroll" },
  { id: "williams", label: "Williams", description: "Nine constructors' championships — a legendary name fighting back.", image: "/f1/teams/cars/williams.png", logo: "/f1/teams/logos/williams.png", drivers: "Carlos Sainz & Alex Albon" },
  { id: "alpine", label: "Alpine", description: "French flair meets racing pedigree — the spirit of Renault reborn.", image: "/f1/teams/cars/alpine.png", logo: "/f1/teams/logos/alpine.png", drivers: "Pierre Gasly & Jack Doohan" },
  { id: "audi", label: "Audi", description: "A new era begins — German engineering enters Formula 1.", image: "/f1/teams/cars/audi.png", logo: "/f1/teams/logos/audi.png", drivers: "Nico Hülkenberg & Gabriel Bortoleto" },
  { id: "haas", label: "Haas", description: "America's F1 team — grit, determination, and a growing presence.", image: "/f1/teams/cars/haas.png", logo: "/f1/teams/logos/haas.png", drivers: "Esteban Ocon & Oliver Bearman" },
  { id: "cadillac", label: "Cadillac", description: "The newest entry on the grid — American ambition at full throttle.", image: "/f1/teams/cars/cadillac.png", logo: "/f1/teams/logos/cadillac.png", drivers: "TBA" },
];

export const personaOptions: KnobOption[] = [
  { id: "pole-position-networker", label: "The Pole Position Networker", description: "First to every conversation, business cards flying before the lights go out.", character: true },
  { id: "qualifying-lap", label: "Qualifying Lap", description: "Warming up with small talk, saving the big pitch for when it counts.", character: true },
  { id: "slow-puncture", label: "The Slow Puncture", description: "Started strong, now quietly deflating at the back of the after-party.", character: true },
  { id: "safety-car", label: "The Safety Car", description: "Keeps the group together, controls the pace, nobody passes without permission.", character: true },
  { id: "backmarker", label: "The Backmarker", description: "Arrived late, missed the keynote, still having a great time in the lobby.", character: true },
  { id: "unbothered", label: "Unbothered", description: "Sunglasses on, lanyard hidden, radiating main-character energy from the corner.", character: true },
  { id: "retired-champion", label: "The Retired Champion", description: "Been coming to Cannes for years, has nothing left to prove, here for the rosé.", character: true },
  { id: "pit-lane-regular", label: "The Pit Lane Regular", description: "Always at the bar, knows every bartender, networking happens between rounds.", character: true },
  { id: "drs-zone", label: "The DRS Zone", description: "Finds the opening, closes the gap, seals the deal before anyone else reacts.", character: true },
  { id: "undercut", label: "The Undercut", description: "Slips into conversations early, steals the connection before you even noticed.", character: true },
  { id: "blown-diffuser", label: "The Blown Diffuser", description: "Loud entrance, chaotic energy, leaves everyone wondering what just happened.", character: true },
  { id: "flying-lap", label: "The Flying Lap", description: "Maximum intensity, zero wasted time, every meeting is a personal best.", character: true },
];

export type Phase =
  | "enter"
  | "brake"
  | "rev"
  | "exit"
  | "podium"
  | "character"
  | "celebrate";

interface PhaseWindow {
  name: Phase;
  start: number;
  end: number;
}

export const PHASES: PhaseWindow[] = [
  { name: "enter", start: 0.0, end: 2.0 },
  { name: "brake", start: 2.0, end: 3.0 },
  { name: "rev", start: 3.0, end: 4.0 },
  { name: "exit", start: 4.0, end: 6.0 },
  { name: "podium", start: 6.0, end: 7.0 },
  { name: "character", start: 7.0, end: 7.5 },
  { name: "celebrate", start: 7.5, end: Infinity },
];

export function getPhase(t: number): Phase {
  for (const p of PHASES) {
    if (t >= p.start && t < p.end) return p.name;
  }
  return "celebrate";
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

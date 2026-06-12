"use client";

// Neon circuit outline SVGs — accurate simplified layouts.
// Each uses a 3-layer stroke: outer glow, mid glow, bright core white.

interface CircuitProps {
  width?: number;
  height?: number;
}

function NeonTrack({
  d,
  extra,
  viewBox,
  width = 240,
  height = 100,
}: CircuitProps & { d: string; extra?: React.ReactNode; viewBox: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer spread */}
      <path d={d} stroke="rgba(0,180,255,0.35)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {/* Mid glow */}
      <path d={d} stroke="#00B8FF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)" opacity="0.8" />
      {/* Bright core */}
      <path d={d} stroke="#E0F6FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {extra}
    </svg>
  );
}

// ─── Monza ───────────────────────────────────────────────────────────────────
// Elongated GP circuit — long main straight, two chicanes, Parabolica sweeper
export function MonzaCircuit(props: CircuitProps) {
  const d = [
    "M 25 98",
    "L 140 98",
    // Rettifilo chicane (right-left-right)
    "L 147 91 L 156 88 L 161 81 L 156 74 L 149 71",
    "L 154 64 L 163 61 L 168 54",
    // Curva Grande sweep
    "Q 190 46 192 23 Q 192 6 167 6",
    // Back straight
    "L 70 6",
    // Roggia chicane
    "L 65 12 L 54 12 L 49 18 L 54 24 L 64 24",
    // Lesmos
    "Q 46 30 37 46",
    // Ascari chicane
    "L 33 52 L 22 52 L 17 58 L 22 64 L 33 64",
    // Parabolica
    "Q 31 82 25 98 Z",
  ].join(" ");

  return <NeonTrack {...props} viewBox="0 0 210 106" d={d} />;
}

// ─── Monaco ──────────────────────────────────────────────────────────────────
// Tight street circuit — iconic Grand Hotel hairpin, tunnel, swimming pool
export function MonacoCircuit(props: CircuitProps) {
  const d = [
    // Harbour straight
    "M 145 112 L 22 112",
    // Sainte Dévote (right-hander, then climbing)
    "Q 6 112 5 96 L 4 52",
    // Massenet / Casino Square
    "Q 3 22 26 12 Q 52 2 74 12",
    // Mirabeau
    "Q 97 22 99 46",
    // Into Loews hairpin
    "Q 102 64 95 76 Q 88 90 72 90",
    // Loews exit (hairpin U-turn)
    "L 60 90 Q 46 90 44 74",
    // Down to Portier
    "L 41 52 Q 39 36 56 30 L 98 28",
    // Tunnel entrance
    "Q 122 26 127 48 L 134 76",
    // Tabac / Swimming Pool
    "Q 138 92 130 102",
    // Rascasse / Anthony Noghes
    "L 116 108 Q 108 116 118 118 Q 132 122 145 112 Z",
  ].join(" ");

  return <NeonTrack {...props} viewBox="0 0 155 125" d={d} />;
}

// ─── Spa ─────────────────────────────────────────────────────────────────────
// Ardennes road circuit — La Source, Eau Rouge / Raidillon, long Kemmel straight
export function SpaCircuit(props: CircuitProps) {
  const d = [
    // La Source hairpin (tight right at top-left)
    "M 24 18 Q 10 18 8 32 Q 6 46 18 52 L 30 58",
    // Eau Rouge / Raidillon dip and climb
    "Q 36 64 34 78 Q 32 92 44 100",
    // Pouhon / Blanchimont sweeping section
    "Q 62 112 90 116 L 130 116",
    // Stavelot / Bus Stop chicane
    "Q 172 116 180 98 L 184 68",
    // Descending back section
    "Q 188 42 176 26",
    // Les Combes chicane at top
    "L 170 20 L 162 14 L 155 20 L 162 26 L 170 26",
    // Kemmel straight
    "L 80 26",
    // Back to La Source
    "Q 52 26 40 18 L 24 18 Z",
  ].join(" ");

  return <NeonTrack {...props} viewBox="0 0 196 126" d={d} />;
}

// Map from option id to component
export const CIRCUIT_SHAPE: Record<string, React.ComponentType<CircuitProps>> = {
  monza: MonzaCircuit,
  monaco: MonacoCircuit,
  spa: SpaCircuit,
  // Silverstone and Suzuka map to audio stems but use monza/monaco visual as fallback
  silverstone: SilverstoneCircuit,
  suzuka: SuzukaCircuit,
};

// Raw path data — used for racing dot getPointAtLength animations
export const CIRCUIT_PATH_DATA: Record<string, { d: string; viewBox: string }> = {
  monza: {
    viewBox: "0 0 210 106",
    d: "M 25 98 L 140 98 L 147 91 L 156 88 L 161 81 L 156 74 L 149 71 L 154 64 L 163 61 L 168 54 Q 190 46 192 23 Q 192 6 167 6 L 70 6 L 65 12 L 54 12 L 49 18 L 54 24 L 64 24 Q 46 30 37 46 L 33 52 L 22 52 L 17 58 L 22 64 L 33 64 Q 31 82 25 98 Z",
  },
  monaco: {
    viewBox: "0 0 155 125",
    d: "M 145 112 L 22 112 Q 6 112 5 96 L 4 52 Q 3 22 26 12 Q 52 2 74 12 Q 97 22 99 46 Q 102 64 95 76 Q 88 90 72 90 L 60 90 Q 46 90 44 74 L 41 52 Q 39 36 56 30 L 98 28 Q 122 26 127 48 L 134 76 Q 138 92 130 102 L 116 108 Q 108 116 118 118 Q 132 122 145 112 Z",
  },
  spa: {
    viewBox: "0 0 196 126",
    d: "M 24 18 Q 10 18 8 32 Q 6 46 18 52 L 30 58 Q 36 64 34 78 Q 32 92 44 100 Q 62 112 90 116 L 130 116 Q 172 116 180 98 L 184 68 Q 188 42 176 26 L 170 20 L 162 14 L 155 20 L 162 26 L 170 26 L 80 26 Q 52 26 40 18 L 24 18 Z",
  },
  silverstone: {
    viewBox: "0 0 196 104",
    d: "M 20 95 L 155 95 Q 178 95 180 72 L 180 50 Q 180 28 162 22 L 120 12 Q 98 8 80 14 L 44 26 Q 22 34 18 56 L 16 72 Q 14 92 20 95 Z",
  },
  suzuka: {
    viewBox: "0 0 152 120",
    d: "M 50 10 Q 72 10 80 24 L 84 40 Q 88 56 78 66 L 64 74 Q 50 80 44 96 Q 40 108 50 114 L 110 114 Q 130 114 136 98 L 140 78 Q 144 58 130 46 L 112 36 Q 98 28 96 12 Q 94 2 80 2 L 62 2 Q 48 2 44 12 Q 40 22 50 28 L 68 36 Q 82 44 80 60",
  },
};

// Fallback shapes for silverstone/suzuka if they're ever used
function SilverstoneCircuit(props: CircuitProps) {
  const d = "M 20 95 L 155 95 Q 178 95 180 72 L 180 50 Q 180 28 162 22 L 120 12 Q 98 8 80 14 L 44 26 Q 22 34 18 56 L 16 72 Q 14 92 20 95 Z";
  return <NeonTrack {...props} viewBox="0 0 196 104" d={d} />;
}

function SuzukaCircuit(props: CircuitProps) {
  const d = "M 50 10 Q 72 10 80 24 L 84 40 Q 88 56 78 66 L 64 74 Q 50 80 44 96 Q 40 108 50 114 L 110 114 Q 130 114 136 98 L 140 78 Q 144 58 130 46 L 112 36 Q 98 28 96 12 Q 94 2 80 2 L 62 2 Q 48 2 44 12 Q 40 22 50 28 L 68 36 Q 82 44 80 60";
  return <NeonTrack {...props} viewBox="0 0 152 120" d={d} />;
}

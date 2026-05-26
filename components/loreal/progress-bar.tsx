"use client";

interface Props {
  percent: number; // 0..100
  label: string; // e.g. "20% to glow"
}

// Glassmorphism pill with an inner gradient fill and a right-aligned label.
// The fill width = `percent`; the label always sits at the far right of the
// outer pill so it's readable on the empty (glass) portion.
export function LorealProgressBar({ percent, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative h-9 w-full overflow-hidden rounded-full"
      style={{
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backdropFilter: "blur(14px) saturate(140%)",
        background: "rgba(255,255,255,0.32)",
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.55) inset",
          "0 1px 0 rgba(255,255,255,0.7) inset",
          "0 4px 18px rgba(120,160,220,0.18)",
        ].join(", "),
      }}
    >
      {/* Inner gradient fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          background:
            "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)",
        }}
      />

      {/* Right-aligned label, always over the empty/glass portion */}
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-tight text-white"
        style={{ textShadow: "0 1px 2px rgba(0,16,80,0.35)" }}
      >
        {label}
      </span>
    </div>
  );
}

"use client";

interface Props {
  percent: number; // 0..100
  label: string; // e.g. "20% to glow"
}

// Glassmorphism pill with an inset gradient fill and a right-aligned label.
// The gradient fill is inset 4px on all sides via an inner padded track so
// there's visible glass around it. Label color matches the page title.
export function LorealProgressBar({ percent, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative h-14 w-full rounded-full"
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
      {/* Inset track that hosts the gradient fill, leaving glass padding on
          all sides between the gradient and the outer pill border. */}
      <div className="absolute inset-[6px] overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background:
              "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)",
          }}
        />
      </div>

      {/* Right-aligned label — same dark navy as the title text */}
      <span
        className="absolute right-5 top-1/2 -translate-y-1/2 font-bold tracking-tight text-[#001050]"
        style={{ fontSize: "clamp(1.15rem, min(5vw, 3vh), 1.7rem)" }}
      >
        {label}
      </span>
    </div>
  );
}

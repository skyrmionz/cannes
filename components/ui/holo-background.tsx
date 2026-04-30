"use client";

import { cn } from "@/lib/utils";

interface HoloBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function HoloBackground({
  children,
  className,
  containerClassName,
}: HoloBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#07070a]",
        containerClassName
      )}
    >
      {/* SVG warp filter */}
      <svg width="0" height="0" className="absolute">
        <filter id="glass-warp">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="3"
            seed="12"
          />
          <feDisplacementMap in="SourceGraphic" scale="45" />
        </filter>
      </svg>

      {/* Warped iridescent layer */}
      <div
        className="pointer-events-none fixed animate-holo-drift"
        style={{
          inset: "-15%",
          background: `
            radial-gradient(circle at 20% 25%, rgba(255, 0, 180, 0.55), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.5), transparent 30%),
            radial-gradient(circle at 45% 75%, rgba(255, 230, 0, 0.38), transparent 35%),
            radial-gradient(circle at 70% 70%, rgba(125, 80, 255, 0.55), transparent 34%),
            linear-gradient(135deg, #111018, #050507 60%, #17121f)
          `,
          filter: "url(#glass-warp) saturate(1.6) contrast(1.1)",
        }}
      >
        {/* Specular highlight streaks */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.55), transparent 38%),
              linear-gradient(300deg, transparent 55%, rgba(255,255,255,0.25), transparent 68%)
            `,
            mixBlendMode: "screen",
            filter: "blur(18px)",
            opacity: 0.65,
          }}
        />

        {/* Fine holographic lines */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                115deg,
                rgba(255,255,255,0.08) 0px,
                rgba(255,255,255,0.02) 2px,
                transparent 7px,
                transparent 18px
              )
            `,
            mixBlendMode: "overlay",
            opacity: 0.45,
          }}
        />
      </div>

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}

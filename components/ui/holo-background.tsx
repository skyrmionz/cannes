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
        "relative min-h-screen w-full overflow-hidden",
        containerClassName
      )}
    >
      {/* SVG foil warp filter */}
      <svg width="0" height="0" className="absolute">
        <filter id="foil-warp">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.035"
            numOctaves={2}
            seed={9}
          />
          <feDisplacementMap in="SourceGraphic" scale={12} />
        </filter>
      </svg>

      {/* Base iridescent foil layer */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            linear-gradient(115deg,
              rgba(255,255,255,0.95),
              rgba(245,250,255,0.9) 18%,
              rgba(255,210,245,0.75) 32%,
              rgba(185,245,255,0.75) 46%,
              rgba(255,250,185,0.65) 62%,
              rgba(210,190,255,0.75) 78%,
              rgba(255,255,255,0.95)
            )
          `,
          filter: "url(#foil-warp)",
        }}
      >
        {/* Rainbow conic + repeating lines — screen blended */}
        <div
          className="absolute"
          style={{
            inset: "-25%",
            background: `
              repeating-linear-gradient(
                105deg,
                transparent 0px,
                rgba(255,255,255,0.1) 18px,
                rgba(255,0,200,0.28) 32px,
                rgba(0,255,255,0.22) 48px,
                rgba(255,255,0,0.18) 64px,
                transparent 92px
              ),
              conic-gradient(
                from 210deg,
                rgba(255,0,170,.45),
                rgba(0,255,255,.35),
                rgba(255,255,120,.35),
                rgba(140,90,255,.4),
                rgba(255,0,170,.45)
              )
            `,
            mixBlendMode: "screen",
            filter: "contrast(1.35) saturate(1.8)",
            opacity: 0.9,
            transform: "rotate(-8deg)",
          }}
        />

        {/* Specular highlights + fine scan lines */}
        <div
          className="absolute"
          style={{
            inset: "-10%",
            background: `
              linear-gradient(120deg, transparent 35%, rgba(255,255,255,.8) 42%, transparent 48%),
              linear-gradient(65deg, transparent 55%, rgba(255,255,255,.45) 61%, transparent 68%),
              repeating-linear-gradient(
                140deg,
                rgba(255,255,255,.18) 0px,
                transparent 2px,
                transparent 26px
              )
            `,
            mixBlendMode: "overlay",
            filter: "blur(1px)",
            opacity: 0.9,
          }}
        />
      </div>

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}

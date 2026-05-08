"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CellophaneBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  interactive?: boolean;
}

export function CellophaneBackground({
  children,
  className,
  containerClassName,
  interactive = true,
}: CellophaneBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const pointerRef = useRef({ x: 50, y: 50 });
  const currentRef = useRef({ x: 50, y: 50 });

  const updateProperties = useCallback(() => {
    if (!containerRef.current) return;

    currentRef.current.x += (pointerRef.current.x - currentRef.current.x) * 0.06;
    currentRef.current.y += (pointerRef.current.y - currentRef.current.y) * 0.06;

    const el = containerRef.current;
    el.style.setProperty("--pointer-x", `${currentRef.current.x}%`);
    el.style.setProperty("--pointer-y", `${currentRef.current.y}%`);
    el.style.setProperty(
      "--bg-x",
      `${(50 - currentRef.current.x) * 1.5 + 50}%`
    );
    el.style.setProperty(
      "--bg-y",
      `${(50 - currentRef.current.y) * 1.5 + 50}%`
    );

    animationRef.current = requestAnimationFrame(updateProperties);
  }, []);

  useEffect(() => {
    if (!interactive) {
      let t = 0;
      const drift = () => {
        t += 0.003;
        pointerRef.current.x = 50 + Math.sin(t) * 30;
        pointerRef.current.y = 50 + Math.cos(t * 0.7) * 20;
      };
      const interval = setInterval(drift, 16);
      animationRef.current = requestAnimationFrame(updateProperties);
      return () => {
        clearInterval(interval);
        cancelAnimationFrame(animationRef.current);
      };
    }

    const handlePointer = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 100;
      pointerRef.current.y = ((e.clientY - rect.top) / rect.height) * 100;
    };

    let t = 0;
    const drift = () => {
      t += 0.003;
      pointerRef.current.x = 50 + Math.sin(t) * 30;
      pointerRef.current.y = 50 + Math.cos(t * 0.7) * 20;
    };
    const interval = setInterval(drift, 16);

    window.addEventListener("pointermove", handlePointer);
    animationRef.current = requestAnimationFrame(updateProperties);

    return () => {
      window.removeEventListener("pointermove", handlePointer);
      clearInterval(interval);
      cancelAnimationFrame(animationRef.current);
    };
  }, [interactive, updateProperties]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#1a1528]",
        containerClassName
      )}
      style={
        {
          "--pointer-x": "50%",
          "--pointer-y": "50%",
          "--bg-x": "50%",
          "--bg-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Layer 1: Rainbow spectrum — the core iridescent color */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              135deg,
              hsl(290, 90%, 65%) 0%,
              hsl(240, 85%, 65%) 7%,
              hsl(190, 90%, 60%) 14%,
              hsl(160, 85%, 55%) 21%,
              hsl(60, 90%, 65%) 28%,
              hsl(30, 90%, 65%) 35%,
              hsl(350, 85%, 65%) 42%,
              hsl(290, 90%, 65%) 50%,
              hsl(240, 85%, 65%) 57%,
              hsl(190, 90%, 60%) 64%,
              hsl(160, 85%, 55%) 71%,
              hsl(60, 90%, 65%) 78%,
              hsl(30, 90%, 65%) 85%,
              hsl(350, 85%, 65%) 92%,
              hsl(290, 90%, 65%) 100%
            )
          `,
          backgroundSize: "300% 300%",
          backgroundPosition: "var(--bg-x) var(--bg-y)",
          filter: "brightness(1.1) contrast(1.15) saturate(1.4)",
          mixBlendMode: "color-dodge",
          opacity: 0.6,
        }}
      />

      {/* Layer 2: Vertical scanlines — holographic film texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.03) 0px,
              rgba(255,255,255,0.06) 1px,
              transparent 2px,
              transparent 4px,
              rgba(255,255,255,0.04) 5px,
              transparent 6px,
              transparent 12px
            ),
            repeating-linear-gradient(
              135deg,
              hsl(280, 70%, 55%) 0%,
              hsl(220, 70%, 55%) 16%,
              hsl(180, 70%, 50%) 33%,
              hsl(130, 70%, 50%) 50%,
              hsl(50, 80%, 55%) 66%,
              hsl(330, 70%, 55%) 83%,
              hsl(280, 70%, 55%) 100%
            )
          `,
          backgroundSize: "12px 12px, 250% 250%",
          backgroundPosition: "0 0, var(--bg-x) var(--bg-y)",
          backgroundBlendMode: "screen",
          filter: "brightness(1.2) contrast(1.3)",
          mixBlendMode: "hard-light",
          opacity: 0.4,
        }}
      />

      {/* Layer 3: Diagonal fine lines — adds the cellophane crinkle */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              60deg,
              transparent 0px,
              rgba(255,255,255,0.04) 1px,
              transparent 2px,
              transparent 8px
            ),
            repeating-linear-gradient(
              120deg,
              transparent 0px,
              rgba(255,255,255,0.03) 1px,
              transparent 2px,
              transparent 10px
            )
          `,
          mixBlendMode: "overlay",
          opacity: 0.7,
        }}
      />

      {/* Layer 4: Specular glare — follows pointer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(
              ellipse 60% 50% at var(--pointer-x) var(--pointer-y),
              rgba(255, 255, 255, 0.2) 0%,
              rgba(255, 255, 255, 0.05) 30%,
              transparent 70%
            )
          `,
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 5: Depth vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(15, 10, 30, 0.5) 100%)",
        }}
      />

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}

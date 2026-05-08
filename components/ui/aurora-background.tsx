"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient: _showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-white",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb 1 — purple/cyan/pink, top-left bias */}
        <div
          className="animate-glossy-drift-1 pointer-events-none absolute left-[-15%] top-[-15%] h-[70vw] w-[70vw] rounded-full will-change-transform"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(180,130,220,0.4), rgba(100,180,255,0.3), rgba(0,212,200,0.3), rgba(255,160,200,0.35), rgba(180,130,220,0.4))",
            filter: "blur(80px)",
          }}
        />
        {/* Orb 2 — orange/purple/blue, bottom-right bias */}
        <div
          className="animate-glossy-drift-2 pointer-events-none absolute bottom-[-10%] right-[-10%] h-[60vw] w-[60vw] rounded-full will-change-transform"
          style={{
            background:
              "conic-gradient(from 120deg, rgba(255,180,150,0.3), rgba(200,140,255,0.35), rgba(120,200,255,0.3), rgba(255,180,150,0.3))",
            filter: "blur(80px)",
          }}
        />
        {/* Orb 3 — cyan/pink/mint, center bias */}
        <div
          className="animate-glossy-drift-3 pointer-events-none absolute left-[20%] top-[30%] h-[50vw] w-[50vw] rounded-full will-change-transform"
          style={{
            background:
              "conic-gradient(from 240deg, rgba(140,200,255,0.35), rgba(255,160,220,0.3), rgba(180,255,220,0.25), rgba(140,200,255,0.35))",
            filter: "blur(80px)",
          }}
        />
      </div>
      {children}
    </div>
  );
};

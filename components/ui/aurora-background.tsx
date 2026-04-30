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
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-[#faf8f4]",
        className,
      )}
      {...props}
    >
      {/* White vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(250,248,244,0.8) 100%)",
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        {/* Primary aurora blob */}
        <div
          className={cn(
            "animate-aurora pointer-events-none absolute -inset-[50%] will-change-transform",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_70%_20%,black_20%,transparent_70%)]",
          )}
          style={{
            backgroundImage:
              "conic-gradient(from 0deg at 50% 50%, #C8A96E 0deg, #E8D5B5 60deg, #f5ede0 120deg, #D4BC8A 180deg, #B8956A 240deg, #E8D5B5 300deg, #C8A96E 360deg)",
            backgroundSize: "150% 150%",
            opacity: 0.5,
            filter: "blur(80px)",
          }}
        />
        {/* Secondary aurora blob — offset and counter-rotating */}
        <div
          className="animate-aurora pointer-events-none absolute -inset-[50%] will-change-transform"
          style={{
            backgroundImage:
              "conic-gradient(from 180deg at 50% 50%, #D4BC8A 0deg, #f5ede0 90deg, #C8A96E 180deg, #E8D5B5 270deg, #D4BC8A 360deg)",
            backgroundSize: "120% 120%",
            opacity: 0.35,
            filter: "blur(100px)",
            animationDuration: "45s",
            animationDirection: "reverse",
          }}
        />
      </div>
      {children}
    </div>
  );
};

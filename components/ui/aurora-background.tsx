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
        "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-white",
        className,
      )}
      {...props}
    >
      {/* White neon glow border */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          boxShadow:
            "inset 0 0 80px rgba(255,255,255,1), inset 0 0 160px rgba(255,255,255,0.7), inset 0 0 240px rgba(255,255,255,0.4)",
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "animate-aurora pointer-events-none absolute -inset-[10px] opacity-40 blur-[20px] will-change-transform",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,transparent_80%)]",
          )}
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg,#C8A96E_0%,#D4BC8A_8%,#E8D5B5_16%,#B8956A_24%,#C8A96E_32%)",
            backgroundSize: "300% 200%",
          }}
        />
        <div
          className="animate-aurora pointer-events-none absolute -inset-[10px] opacity-30 blur-[30px] will-change-transform"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#D4BC8A_0%,#C8A96E_10%,#E8D5B5_20%,#B8956A_30%,#D4BC8A_40%)",
            backgroundSize: "200% 300%",
            animationDuration: "45s",
            animationDirection: "reverse",
          }}
        />
      </div>
      {children}
    </div>
  );
};

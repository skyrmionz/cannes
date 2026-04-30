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
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] invert filter will-change-transform",
            "[background-image:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%),repeating-linear-gradient(100deg,#C8A96E_10%,#D4BC8A_15%,#E8D5B5_20%,#B8956A_25%,#C8A96E_30%)]",
            "[background-size:300%,_200%] [background-position:50%_50%,50%_50%]",
            "after:absolute after:inset-0 after:mix-blend-difference after:content-['']",
            "after:[background-image:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%),repeating-linear-gradient(100deg,#C8A96E_10%,#D4BC8A_15%,#E8D5B5_20%,#B8956A_25%,#C8A96E_30%)]",
            "after:[background-size:200%,_100%] after:[background-attachment:fixed]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
          )}
        />
      </div>
      {children}
    </div>
  );
};

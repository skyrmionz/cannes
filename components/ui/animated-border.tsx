"use client";

import { cn } from "@/lib/utils";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
  active?: boolean;
}

export function AnimatedBorder({
  children,
  className,
  borderClassName: _borderClassName,
  active = true,
}: AnimatedBorderProps) {
  return (
    <div
      className={cn("rounded-[inherit] transition-all duration-500", className)}
      style={{
        backdropFilter: active
          ? "blur(16px) saturate(180%)"
          : "blur(12px) saturate(150%)",
        background: active
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(255, 255, 255, 0.08)",
        border: active
          ? "1.5px solid rgba(200, 169, 110, 0.5)"
          : "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(200,169,110,0.15), 0 4px 20px rgba(0,0,0,0.2)"
          : "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      {children}
    </div>
  );
}

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
  borderClassName,
  active = true,
}: AnimatedBorderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[inherit] p-[2px]", className)}>
      <div
        className={cn(
          "absolute inset-[-1000%] animate-[spin_3s_linear_infinite] transition-opacity duration-500",
          "bg-[conic-gradient(from_90deg_at_50%_50%,#C8A96E_0%,#E8D5B5_25%,#FFFFFF_50%,#E8D5B5_75%,#C8A96E_100%)]",
          active ? "opacity-100" : "opacity-0",
          borderClassName
        )}
      />
      <div
        className={cn(
          "absolute inset-[2px] rounded-[inherit] transition-colors duration-500",
          active ? "bg-transparent" : "bg-neutral-200/60"
        )}
      />
      <div className="relative h-full w-full rounded-[inherit] bg-white">
        {children}
      </div>
    </div>
  );
}

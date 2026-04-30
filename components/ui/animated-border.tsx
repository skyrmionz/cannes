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
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[inherit]", className)}>
      <div
        className={cn(
          "absolute inset-[-1000%] animate-[spin_3s_linear_infinite]",
          "bg-[conic-gradient(from_90deg_at_50%_50%,#C8A96E_0%,#E8D5B5_25%,#FFFFFF_50%,#E8D5B5_75%,#C8A96E_100%)]",
          borderClassName
        )}
      />
      <div className="relative h-full w-full rounded-[inherit] bg-[#111]">
        {children}
      </div>
    </div>
  );
}

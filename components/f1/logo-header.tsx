"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoHeaderProps {
  className?: string;
}

export function LogoHeader({ className }: LogoHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        className
      )}
    >
      <Image
        src="/logos/f1.png"
        alt="F1"
        width={100}
        height={50}
        className="h-8 w-auto object-contain"
      />
      <div className="h-6 w-px bg-white/40" />
      <Image
        src="/logos/salesforce.png"
        alt="Salesforce"
        width={120}
        height={50}
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}

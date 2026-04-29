"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoHeaderProps {
  className?: string;
}

export function LogoHeader({ className }: LogoHeaderProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Image
        src="/logos/loreal.png"
        alt="L'Oréal"
        width={120}
        height={50}
        className="h-10 w-auto object-contain brightness-0 invert"
      />
      <div className="h-6 w-px bg-white/40" />
      <Image
        src="/logos/salesforce-v2.png"
        alt="Salesforce"
        width={120}
        height={50}
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}

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
        "flex items-center justify-center gap-8",
        className
      )}
    >
      <Image
        src="/logos/f1.png"
        alt="F1"
        width={200}
        height={100}
        className="object-contain"
        style={{ height: "clamp(70px, 14vw, 160px)", width: "auto" }}
      />
      <div className="bg-white/40" style={{ width: 2, height: "clamp(60px, 13vw, 144px)" }} />
      <Image
        src="/logos/salesforce-v2.png"
        alt="Salesforce"
        width={220}
        height={100}
        className="object-contain"
        style={{ height: "clamp(88px, 17vw, 192px)", width: "auto" }}
      />
    </div>
  );
}

export function AstroAvatar({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://developer.salesforce.com/resource/images/astro/Astro_DJ.png"
      alt="Agent Astro"
      className={cn("object-contain", className)}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const fallback = target.nextSibling as HTMLElement | null;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  );
}

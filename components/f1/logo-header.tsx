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
        "flex flex-col items-center gap-3",
        className
      )}
    >
      <div className="flex items-center justify-center gap-4">
        <Image
          src="/logos/f1.png"
          alt="F1"
          width={100}
          height={50}
          className="h-8 w-auto object-contain"
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://a.slack-edge.com/9cac913/marketing/img/features/slackbot/img-slackbot-blink.gif"
        alt="Slackbot"
        className="h-12 w-12 object-contain"
      />
    </div>
  );
}

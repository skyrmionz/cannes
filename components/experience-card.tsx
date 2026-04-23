"use client";

import Link from "next/link";
import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";

interface ExperienceCardProps {
  name: string;
  href: string;
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
}

export function ExperienceCard({
  name,
  href,
  logo,
  logoWidth = 120,
  logoHeight = 60,
}: ExperienceCardProps) {
  return (
    <Link href={href} className="block">
      <CometCard className="cursor-pointer">
        <div className="flex h-80 w-72 flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
          <Image
            src={logo}
            alt={`${name} logo`}
            width={logoWidth}
            height={logoHeight}
            className="object-contain"
          />
          <span className="text-xl font-semibold tracking-wide text-white">
            {name}
          </span>
        </div>
      </CometCard>
    </Link>
  );
}

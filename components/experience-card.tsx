"use client";

import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";
import { usePageTransition } from "@/components/page-transition";

interface ExperienceCardProps {
  name: string;
  href: string;
  logo: string;
}

export function ExperienceCard({ name, href, logo }: ExperienceCardProps) {
  const { navigateTo } = usePageTransition();

  return (
    <div onClick={() => navigateTo(href)} className="block cursor-pointer">
      <CometCard>
        <div className="flex h-72 w-64 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:h-80 md:w-72 md:p-8">
          <Image
            src={logo}
            alt={`${name} logo`}
            width={200}
            height={120}
            className="w-full object-contain"
          />
        </div>
      </CometCard>
    </div>
  );
}

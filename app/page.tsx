"use client";

import { cn } from "@/lib/utils";
import { ExperienceCard } from "@/components/experience-card";
import { TransitionProvider } from "@/components/page-transition";

const experiences = [
  { name: "F1", href: "/f1", logo: "/logos/f1.png" },
  { name: "Equinox", href: "/equinox", logo: "/logos/equinox.png" },
  { name: "L'Oréal", href: "/loreal", logo: "/logos/loreal.png" },
];

export default function Home() {
  return (
    <TransitionProvider>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
        {/* Dot background */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#404040_1px,transparent_1px)]"
          )}
        />
        {/* Radial fade mask */}
        <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-16 px-4">
          <h1 className="bg-gradient-to-r from-gray-500 via-white to-gray-500 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-6xl">
            Choose your experience
          </h1>

          <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.name}
                name={exp.name}
                href={exp.href}
                logo={exp.logo}
              />
            ))}
          </div>
        </div>
      </div>
    </TransitionProvider>
  );
}

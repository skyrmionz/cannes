"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { LogoHeader } from "./logo-header";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AuroraBackground className="!h-auto min-h-screen !bg-white" showRadialGradient>
      <div className="relative z-10 flex flex-col items-center">
        <LogoHeader className="mb-16" />

        <motion.h2
          className="max-w-md text-center font-serif text-xl font-light tracking-wide text-neutral-800 md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          We&apos;re putting together your personal beauty kit now!
        </motion.h2>

        <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-200">
          <motion.div
            className="h-full rounded-full bg-[#C8A96E]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </AuroraBackground>
  );
}

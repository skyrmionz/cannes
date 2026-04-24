"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { DotBg } from "./dot-bg";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <DotBg />

      <div className="relative z-10 flex flex-col items-center">
        <LogoHeader className="mb-16" />

        <motion.h2
          className="text-xl font-semibold uppercase tracking-[0.2em] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Creating your theme song now...
        </motion.h2>

        <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            className="h-full rounded-full bg-[#E10600]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

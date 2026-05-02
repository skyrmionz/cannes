"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
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
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      {/* Logos pinned to the top */}
      <motion.div
        className="relative z-10 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
      </motion.div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SlackbotAvatar className="mx-auto mb-8 h-28 w-28 md:h-36 md:w-36" />
        </motion.div>

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

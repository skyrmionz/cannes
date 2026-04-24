"use client";

import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { DotBg } from "./dot-bg";

interface IntroScreenProps {
  onNext: () => void;
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <DotBg />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <LogoHeader className="mb-16" />
        </motion.div>

        <motion.p
          className="text-sm uppercase tracking-[0.3em] text-[#b0b0b0]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Every driver has a theme song
        </motion.p>

        <motion.h1
          className="mt-4 text-4xl font-semibold text-white md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Ready to make history?
        </motion.h1>

        <motion.button
          onClick={onNext}
          className="mt-12 rounded-sm bg-[#E10600] px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#c00500]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Start
        </motion.button>
      </div>
    </div>
  );
}

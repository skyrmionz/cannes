"use client";

import { motion } from "motion/react";
import { LogoHeader, AstroAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";

interface IntroScreenProps {
  onNext: () => void;
}

export function IntroScreen({ onNext }: IntroScreenProps) {
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
          <AstroAvatar className="mx-auto mb-8 h-40 w-40" />
        </motion.div>

        <motion.h1
          className="text-center text-4xl font-bold uppercase tracking-tight text-white md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          I&apos;m Agent Astro.
        </motion.h1>

        <motion.p
          className="mt-4 max-w-sm text-center text-base text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Your F1® audio producer and part of your pit crew.
        </motion.p>

        <motion.p
          className="mt-3 max-w-sm text-center text-sm text-white/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Let&apos;s make your personalized track.
        </motion.p>

        <motion.button
          onClick={onNext}
          className="mt-10 rounded-full bg-white px-10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#001050] shadow-lg transition-opacity hover:opacity-90"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          Ready to make noise?
        </motion.button>
      </div>
    </div>
  );
}

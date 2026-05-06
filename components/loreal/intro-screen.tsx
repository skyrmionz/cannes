"use client";

import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { SlackbotAvatar } from "../f1/logo-header";

interface IntroScreenProps {
  onNext: () => void;
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
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

        <motion.p
          className="max-w-md text-center text-sm uppercase tracking-[0.3em] text-neutral-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          I&apos;m Slackbot, your personal producer.
        </motion.p>

        <motion.h1
          className="mt-4 text-center font-serif text-4xl text-neutral-900 md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Let&apos;s begin your consultation.
        </motion.h1>

        <motion.button
          onClick={onNext}
          className="mt-10 rounded-full border-2 px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-[#C8A96E] hover:text-white"
          style={{ borderColor: "#C8A96E" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          Start Consultation
        </motion.button>
      </div>
    </div>
  );
}

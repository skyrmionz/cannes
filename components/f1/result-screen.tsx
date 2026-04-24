"use client";

import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { DotBg } from "./dot-bg";

interface ResultScreenProps {
  driverName: string;
  onStartOver: () => void;
}

export function ResultScreen({ driverName, onStartOver }: ResultScreenProps) {
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

        <motion.h2
          className="text-center text-2xl font-semibold uppercase tracking-[0.15em] text-white md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Introducing{" "}
          <span className="text-[#E10600]">{driverName}</span>,
          <br />
          representing Cannes!
        </motion.h2>

        {/* Audio player placeholder — Suno AI integration later */}
        <motion.div
          className="mt-10 flex w-full max-w-sm flex-col items-center rounded-sm border border-neutral-800 bg-[#1a1a1a] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="mb-4 text-sm uppercase tracking-wider text-[#b0b0b0]">
            Your theme song
          </p>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 transition-colors hover:border-[#E10600]">
            <svg
              className="ml-0.5 h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="mt-4 h-1 w-full rounded-full bg-neutral-800">
            <div className="h-full w-0 rounded-full bg-[#E10600]" />
          </div>
        </motion.div>

        <motion.button
          onClick={onStartOver}
          className="mt-12 rounded-sm border border-neutral-700 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#E10600] hover:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Start Over
        </motion.button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";

interface ResultScreenProps {
  driverName: string;
  mp3Url: string | null;
  onStartOver: () => void;
}

export function ResultScreen({ driverName, mp3Url, onStartOver }: ResultScreenProps) {
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

        <motion.div
          className="mt-10 flex w-full max-w-sm flex-col items-center rounded-sm border border-neutral-800 bg-[#1a1a1a] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="mb-4 text-sm uppercase tracking-wider text-[#b0b0b0]">
            Your theme song
          </p>
          {mp3Url ? (
            <audio
              src={mp3Url}
              controls
              autoPlay
              preload="auto"
              className="w-full"
            />
          ) : (
            <p className="text-xs text-neutral-500">Track unavailable</p>
          )}
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

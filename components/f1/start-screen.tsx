"use client";

import { motion } from "motion/react";
import { DotBg } from "./dot-bg";
import { LogoHeader } from "./logo-header";
import { AstroAvatar } from "./logo-header";

interface StartScreenProps {
  onStart: () => void;
}

const words = ["ARE YOU", "PODIUM", "READY?"];

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer"
      style={{ background: "#001050" }}
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <DotBg />

      {/* Logos at top */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-10 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
      </motion.div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        {/* Stacked headline */}
        <div className="mb-6 flex flex-col items-center">
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="block text-center font-bold uppercase leading-none tracking-tight text-white"
              style={{ fontSize: "clamp(3rem, 16vw, 7rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Astro avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <AstroAvatar className="mb-4 h-24 w-24" />
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="mb-8 text-center text-sm uppercase tracking-[0.25em] text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          Powered by Agent Astro from Salesforce
        </motion.p>

        {/* Pulsing CTA */}
        <motion.button
          className="rounded-full bg-white px-10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#001050] shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1], y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="block"
          >
            Tap to start
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

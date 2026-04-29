"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface MirrorScreenProps {
  onStart: () => void;
}

export function MirrorScreen({ onStart }: MirrorScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden bg-black"
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Mirror surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-[#0c0c0c] to-neutral-900" />

      {/* Ring light glow — white inset around edges */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.18), inset 0 0 300px rgba(255,255,255,0.06), inset 0 0 40px rgba(255,255,255,0.12)",
        }}
      />

      {/* Animated shimmer sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
      />

      {/* Subtle reflection lines */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute left-0 top-[30%] h-px w-full bg-white" />
        <div className="absolute left-0 top-[60%] h-px w-full bg-white" />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Image
            src="/logos/loreal.png"
            alt="L'Oréal"
            width={200}
            height={80}
            className="h-16 w-auto object-contain brightness-0 invert md:h-20"
            priority
          />
        </motion.div>

        <motion.p
          className="mt-6 font-serif text-lg tracking-wide text-white/70 md:text-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Begin your consultation
        </motion.p>

        <motion.p
          className="mt-10 text-xs uppercase tracking-[0.3em] text-white/40"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Tap to start
        </motion.p>
      </div>
    </motion.div>
  );
}

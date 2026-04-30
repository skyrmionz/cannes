"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface MirrorScreenProps {
  onStart: () => void;
}

export function MirrorScreen({ onStart }: MirrorScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden"
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Frosted glass border */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow:
            "inset 0 0 40px rgba(255,255,255,0.15), inset 0 0 80px rgba(180,160,255,0.06), 0 0 40px rgba(180,160,255,0.08)",
        }}
      />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Gold circle around logo + text */}
        <div
          className="flex flex-col items-center rounded-full border border-white/20 px-16 py-20 md:px-24 md:py-28"
          style={{
            backdropFilter: "blur(12px) saturate(150%)",
            background: "rgba(255,255,255,0.08)",
            boxShadow:
              "0 0 40px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Image
              src="/logos/loreal.png"
              alt="L'Oréal"
              width={320}
              height={120}
              className="h-24 w-auto object-contain md:h-32"
              priority
            />
          </motion.div>

          <motion.p
            className="mt-1 font-serif text-lg tracking-wide text-white/80 md:text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Let&apos;s begin your consultation!
          </motion.p>

          <motion.p
            className="mt-8 text-xs uppercase tracking-[0.3em] text-white/40"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap to start
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

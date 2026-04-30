"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { AuroraBackground } from "@/components/ui/aurora-background";

interface MirrorScreenProps {
  onStart: () => void;
}

export function MirrorScreen({ onStart }: MirrorScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden"
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <AuroraBackground className="!h-full !bg-white" showRadialGradient={false}>
        {/* White neon border */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            border: "3px solid rgba(255, 255, 255, 0.9)",
            boxShadow:
              "inset 0 0 30px rgba(255,255,255,0.8), inset 0 0 60px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.2)",
          }}
        />

        {/* Center content */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Gold circle around logo + text */}
          <div
            className="flex flex-col items-center rounded-full border-2 border-[#C8A96E]/40 px-16 py-20 md:px-24 md:py-28"
            style={{
              boxShadow:
                "0 0 30px rgba(200,169,110,0.1), inset 0 0 30px rgba(200,169,110,0.05)",
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
                className="h-24 w-auto object-contain brightness-0 md:h-32"
                priority
              />
            </motion.div>

            <motion.p
              className="mt-1 font-serif text-lg tracking-wide text-neutral-600 md:text-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Let&apos;s begin your consultation!
            </motion.p>

            <motion.p
              className="mt-8 text-xs uppercase tracking-[0.3em] text-neutral-400"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Tap to start
            </motion.p>
          </div>
        </div>
      </AuroraBackground>
    </motion.div>
  );
}

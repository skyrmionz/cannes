"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { AnimatedBorder } from "@/components/ui/animated-border";

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
          border: "1px solid rgba(200, 169, 110, 0.2)",
          boxShadow:
            "inset 0 0 60px rgba(255,255,255,0.3), inset 0 0 80px rgba(200,169,110,0.04)",
        }}
      />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center">
        <AnimatedBorder className="rounded-full" innerClassName="bg-white">
          <div
            className="flex flex-col items-center rounded-full px-16 py-20 md:px-24 md:py-28"
            style={{
              boxShadow:
                "0 0 40px rgba(200,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
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
        </AnimatedBorder>
      </div>
    </motion.div>
  );
}

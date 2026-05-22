"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { DotBg } from "./dot-bg";

interface IntroScreenProps {
  onNext: () => void;
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      {/* Stripe chrome */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 w-40 opacity-80">
        <Image src="/f1/stripe-top-left.png" alt="" width={160} height={160} unoptimized className="object-contain" />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 w-40 opacity-80">
        <Image src="/f1/stripe-bottom-right.png" alt="" width={160} height={160} unoptimized className="object-contain" />
      </div>

      {/* Logo */}
      <motion.div
        className="relative z-10 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
      </motion.div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0">
        {/* Astro with headphones */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, type: "spring", stiffness: 260, damping: 22 }}
        >
          <Image
            src="/f1/astro-headphones.png"
            alt="Agent Astro"
            width={160}
            height={160}
            unoptimized
            className="mx-auto mb-4"
          />
        </motion.div>

        <motion.h1
          className="text-center text-4xl font-extrabold uppercase tracking-tight text-white"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45 }}
        >
          I&apos;m Agent Astro.
        </motion.h1>

        <motion.p
          className="mt-3 max-w-xs text-center text-sm text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
        >
          Your F1® audio producer and part of your pit crew.
        </motion.p>

        <motion.p
          className="mt-1.5 max-w-xs text-center text-xs text-white/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.54, duration: 0.4 }}
        >
          Let&apos;s make your personalised track.
        </motion.p>

        {/* Figma-style pill CTA */}
        <motion.button
          onClick={onNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.94 }}
          transition={{ delay: 0.68, duration: 0.4 }}
          className="mt-8 rounded-full px-10 py-3.5 text-sm font-extrabold uppercase tracking-[0.15em]"
          style={{
            background: "#CCE8FF",
            color: "#022AC0",
            boxShadow: "0 4px 20px rgba(0,179,255,0.3)",
          }}
        >
          Start your engines
        </motion.button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GlassyButton } from "./glassy-button";

interface IntroScreenProps {
  onStart: () => void;
}

// NOTE: background, glass card, and CornerTap live in app/loreal/page.tsx
// as a persistent shell so they stay still while step content cross-zooms.
export function LorealIntroScreen({ onStart }: IntroScreenProps) {
  return (
    <>
      {/* Content column — top stack; CTA pinned absolute below.
          pb-60 leaves room so body copy can't slide under the button. */}
      <div className="relative z-20 flex h-full w-full flex-col items-center px-8 pt-14 pb-60">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center text-[#001050]">
          <motion.h1
            className="font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 8vw, 2.75rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          >
            Coucou,
            <br />
            I&apos;m Agent Astro.
          </motion.h1>

          {/* Squiggly divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-[260px] px-2"
          >
            <Image
              src="/loreal/divider-line.png"
              alt=""
              width={1200}
              height={4}
              className="h-auto w-full select-none opacity-80"
            />
          </motion.div>

          {/* Tagline — directly above the Astro icon */}
          <motion.p
            className="font-semibold leading-snug tracking-tight"
            style={{ fontSize: "clamp(1.05rem, 4.4vw, 1.5rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
          >
            I&apos;ll be your La Croisette vibe analyzer!
          </motion.p>

          {/* Astro icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/loreal/agent-astro.png"
              alt="Agent Astro"
              width={720}
              height={720}
              priority
              className="h-auto w-[min(58vw,260px)] select-none"
              style={{ filter: "drop-shadow(0 18px 40px rgba(60,120,240,0.3))" }}
            />
          </motion.div>

          {/* Body copy — Salesforce Sans (system sans-serif fallback) */}
          <motion.p
            className="text-[#001050]/85 leading-snug"
            style={{
              fontSize: "clamp(0.95rem, 3.8vw, 1.05rem)",
              fontFamily:
                'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
          >
            We&apos;ll use L&apos;Oréal beauty data and Salesforce intelligence
            to find your vibe.
          </motion.p>
        </div>
      </div>

      {/* CTA — pinned at bottom-14 to match start screen */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-6">
        <GlassyButton onClick={onStart} delay={0.95}>
          Let&apos;s glow
        </GlassyButton>
      </div>
    </>
  );
}

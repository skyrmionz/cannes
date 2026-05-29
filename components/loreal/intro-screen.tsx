"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GlassyButton } from "./glassy-button";

interface IntroScreenProps {
  onStart: () => void;
}

// NOTE: background, glass card, and CornerTap live in app/loreal/page.tsx
// as a persistent shell so they stay still while step content cross-zooms.
//
// Layout: Astro icon spans the full glass card width at the very top with
// ~25% extending above the visible area (clipped by overflow-hidden). The
// rest of the content sits below in a padded column.
export function LorealIntroScreen({ onStart }: IntroScreenProps) {
  // Astro is sized to span the full glass card. The card has inset-3 (12px)
  // around the viewport, so its width is effectively 100vw - 24px on phones.
  // Cap by viewport height so it doesn't dominate landscape monitors.
  const astroSize = "min(100vw, 60vh)";

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden">
      {/* Astro icon — full glass card width, 25% clipped above by overflow */}
      <motion.div
        className="relative flex w-full shrink-0 justify-center"
        style={{
          marginTop: `calc(${astroSize} * -0.25)`,
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/loreal/agent-astro.png"
          alt="Agent Astro"
          width={720}
          height={720}
          priority
          className="h-auto select-none"
          style={{ width: astroSize }}
        />
      </motion.div>

      {/* Content column — padded, fills remaining space */}
      <div
        className="flex w-full max-w-2xl flex-1 min-h-0 flex-col items-center px-8 text-center text-[#001050]"
        style={{
          paddingBottom: "clamp(1.25rem, 6vh, 5rem)",
          rowGap: "clamp(0.5rem, 1.5vh, 1rem)",
        }}
      >
        <motion.h1
          className="shrink-0 font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "min(10vw, 6vh)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          Coucou,
          <br />
          I&apos;m Agent Astro.
        </motion.h1>

        {/* Squiggly divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-3 shrink-0 px-2"
          style={{ width: "min(80vw, 36vh)" }}
        >
          <Image
            src="/loreal/divider-line.png"
            alt=""
            width={1200}
            height={4}
            className="h-auto w-full select-none opacity-80"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-3 shrink-0 font-semibold leading-snug tracking-tight"
          style={{ fontSize: "min(6vw, 3.2vh)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          I&apos;ll be your La Croisette vibe analyzer!
        </motion.p>

        {/* Body copy — Salesforce Sans */}
        <motion.p
          className="mt-4 shrink-0 leading-snug text-[#001050]/85"
          style={{
            fontSize: "min(5vw, 2.4vh)",
            maxWidth: "min(85vw, 42rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
        >
          We&apos;ll use beauty data and Salesforce intelligence to find your
          vibe.
        </motion.p>

        {/* CTA — bottom of the column */}
        <div className="mt-auto flex shrink-0 justify-center pt-4">
          <GlassyButton onClick={onStart} delay={0.9}>
            Get started
          </GlassyButton>
        </div>
      </div>
    </div>
  );
}

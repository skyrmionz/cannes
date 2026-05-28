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
// Layout uses a flex column with justify-between so the content distributes
// proportionally on any viewport height. All sizes use min(vw, vh, px) so
// typography + the Astro icon scale up on tall windows like the vibing screen.
export function LorealIntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden px-8"
      style={{
        paddingTop: "clamp(1.25rem, 5vh, 4rem)",
        paddingBottom: "clamp(1.25rem, 6vh, 5rem)",
      }}
    >
      {/* Grid layout — only the Astro row absorbs slack, everything else is
          shrink-0 so the bottom CTA is always visible inside the glass card. */}
      <div
        className="grid w-full max-w-2xl flex-1 min-h-0 items-center text-center text-[#001050]"
        style={{
          gridTemplateRows: "auto auto auto minmax(0, 1fr) auto",
          rowGap: "clamp(0.5rem, 1.5vh, 1rem)",
        }}
      >
        <motion.h1
          className="shrink-0 font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "min(10vw, 6vh)" }}
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
          className="shrink-0 justify-self-center px-2"
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
          className="shrink-0 font-semibold leading-snug tracking-tight"
          style={{ fontSize: "min(6vw, 3.2vh)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
        >
          I&apos;ll be your La Croisette vibe analyzer!
        </motion.p>

        {/* Astro icon — only shrinkable row in the grid. */}
        <motion.div
          className="flex min-h-0 items-center justify-center"
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
            className="h-auto select-none"
            style={{
              width: "min(60vw, 32vh)",
              maxHeight: "32vh",
              objectFit: "contain",
            }}
          />
        </motion.div>

        {/* Body copy — Salesforce Sans */}
        <motion.p
          className="shrink-0 text-[#001050]/85 leading-snug justify-self-center"
          style={{
            fontSize: "min(5vw, 2.4vh)",
            maxWidth: "min(85vw, 42rem)",
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

      {/* CTA pinned to bottom of the screen content */}
      <div className="flex shrink-0 justify-center pt-4">
        <GlassyButton onClick={onStart} delay={0.95}>
          Let&apos;s glow
        </GlassyButton>
      </div>
    </div>
  );
}

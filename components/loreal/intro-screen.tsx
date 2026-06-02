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
  // Astro is wider than the glass card so the face fills the glass card's
  // interior width (cheeks reach both sides). The wrapper uses inset-3 +
  // overflow-hidden + rounded-[40px] so the glass card's top edge becomes
  // the clip line — Astro's top is cut off by the glass container itself.
  const astroSize = "min(160vw, 105vh)";

  return (
    <div className="absolute inset-3 flex flex-col items-center overflow-hidden rounded-[40px]">
      {/* Astro icon — oversized so the top portion is clipped by the glass
          card's rounded top edge. Pulled down so more of the face is visible. */}
      <motion.div
        className="relative flex w-full shrink-0 justify-center"
        style={{
          marginTop: `calc(${astroSize} * -0.35)`,
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

      {/* Content column */}
      <div
        className="flex w-full max-w-2xl flex-1 min-h-0 flex-col items-center px-8 text-center text-[#001050]"
        style={{
          paddingBottom: "clamp(1.25rem, 6vh, 5rem)",
        }}
      >
        <motion.h1
          className="shrink-0 whitespace-nowrap font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "min(8vw, 5.2vh)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          Coucou,
          <br />
          I&apos;m Agent Astro.
        </motion.h1>

        {/* Squiggly divider — extra spacing above to separate from headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-6 shrink-0 px-2"
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

        {/* Body copy — right below the divider */}
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
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          I&rsquo;ll ask about your OOO vibe, you&rsquo;ll dial it in, and
          we&rsquo;ll create your away status together.
        </motion.p>

        {/* CTA — pushed to the bottom */}
        <div className="mt-auto flex shrink-0 justify-center">
          <GlassyButton onClick={onStart} delay={0.85}>
            Get started
          </GlassyButton>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <div
      className="absolute inset-3 flex flex-col items-center overflow-hidden rounded-[40px] text-[#001050]"
      style={{ paddingTop: "clamp(3.5rem, 10vh, 6rem)" }}
    >
      {/* Title */}
      <motion.h1
        className="shrink-0 whitespace-nowrap text-center font-bold leading-[1.05] tracking-tight"
        style={{ fontSize: "min(10vw, 6vh)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        Coucou,
        <br />
        I&apos;m Agent Astro.
      </motion.h1>

      {/* Body copy directly below title */}
      <motion.p
        className="mt-4 shrink-0 px-8 text-center leading-snug text-[#001050]/85"
        style={{
          fontSize: "min(5vw, 2.4vh)",
          maxWidth: "min(85vw, 42rem)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        I&rsquo;ll ask about your OOO vibe, you&rsquo;ll dial it in, and
        we&rsquo;ll create your away status together.
      </motion.p>

      {/* Center region: tight gap between subtitle/wave/Astro */}
      <div className="flex flex-1 min-h-0 w-full flex-col items-center">
        {/* Wave divider — small fixed gap below the subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="shrink-0 px-2"
          style={{
            width: "min(34vw, 18vh)",
            marginTop: "clamp(2.5rem, 7vh, 4.5rem)",
            marginBottom: "clamp(2.5rem, 7vh, 4.5rem)",
          }}
        >
          <Image
            src="/loreal/divider-line.png"
            alt=""
            width={1200}
            height={4}
            className="h-auto w-full select-none"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(26%) sepia(98%) saturate(1800%) hue-rotate(210deg) brightness(100%) contrast(90%)",
            }}
          />
        </motion.div>

        {/* Astro — slightly smaller than before */}
        <motion.div
          className="flex shrink-0 min-h-0 justify-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          style={{ width: "min(68vw, 46vh)" }}
        >
          <Image
            src="/loreal/agent-astro.png"
            alt="Agent Astro"
            width={2981}
            height={2756}
            priority
            className="h-auto w-full select-none"
          />
        </motion.div>
      </div>

      {/* CTA */}
      <div
        className="shrink-0 flex justify-center"
        style={{
          marginTop: "clamp(0.5rem, 1.5vh, 1rem)",
          paddingBottom: "clamp(2rem, 5vh, 4rem)",
        }}
      >
        <GlassyButton onClick={onStart} delay={0.85}>
          Let&apos;s go
        </GlassyButton>
      </div>
    </div>
  );
}

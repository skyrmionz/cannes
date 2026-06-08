"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GlassyButton } from "./glassy-button";

interface StartScreenProps {
  onStart: () => void;
}

// NOTE: background, glass card, and CornerTap live in app/loreal/page.tsx
// as a persistent shell so they stay still while step content cross-zooms.
//
// Layout uses a flex column with three flex-1 sections (logo / headline+glasses
// / powered-by + CTA) so the screen fills any viewport height proportionally.
// All typography + image sizing uses min(N vw, M vh, Kpx) so things scale up
// on tall/wide windows instead of capping at a small px maximum.
export function LorealStartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6"
      style={{
        paddingTop: "clamp(2rem, 6vh, 4rem)",
        paddingBottom: "clamp(1rem, 3vh, 2rem)",
      }}
    >
      {/* Umbrella — anchored to the top-right, leans further left so the
          canopy reaches the left edge. Pivot at the bottom-right so only
          the top-left tip of the canopy visibly sways. */}
      <motion.div
        className="umbrella-sway pointer-events-none absolute z-20 select-none"
        style={{
          top: "calc(-1 * min(14vw, 9vh))",
          right: "calc(-1 * min(8vw, 5vh))",
          width: "min(105vw, 88vh)",
          transformOrigin: "100% 100%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loreal/umbrella.png"
          alt=""
          width={1060}
          height={956}
          draggable={false}
          className="h-auto w-full select-none"
        />
      </motion.div>

      {/* Spacer reserves room for the umbrella canopy so the headline never
          sits under it. Sized smaller than half the screen so the headline
          stays vertically centered between the umbrella and the CTA. */}
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: "min(38vw, 30vh)" }}
      />

      {/* Headline + image + tagline group — vertically centered between the
          umbrella spacer above and the CTA group below. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-[#001050]">
        <HeadlineWord
          text="Your"
          delay={0.7}
          fontSize="min(18vw, 10vh)"
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
          className="relative"
          style={{
            width: "min(72vw, 38vh)",
            marginTop: "clamp(0.5rem, 1.5vh, 1rem)",
            marginBottom: "clamp(0.25rem, 0.8vh, 0.5rem)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/spf-sand.png"
            alt="SPF"
            draggable={false}
            className="h-auto w-full select-none"
          />
          {/* Crab sitting on the sand, centered, upright */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/crab.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              width: "10%",
              left: "50%",
              bottom: "8%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
        <HeadlineWord
          text="Status Protection"
          delay={1.0}
          fontSize="min(11vw, 6vh)"
        />
        <HeadlineWord
          text="Formulator"
          delay={1.1}
          fontSize="min(14vw, 7.5vh)"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5 }}
          className="mt-3 max-w-2xl text-center font-semibold leading-snug tracking-tight text-[#001050]"
          style={{ fontSize: "min(5vw, 2.6vh)" }}
        >
          Answer three questions;
          <br />
          walk away with your Cannes status vibe...
          <br />
          and the SPF to match.
        </motion.p>
      </div>

      {/* CTA — explicit gap above the tagline and below to powered-by so the
          button never touches either, on tall or short viewports. */}
      <div
        className="relative z-10 shrink-0"
        style={{
          marginTop: "clamp(1.5rem, 5vh, 3.5rem)",
          marginBottom: "clamp(1.5rem, 5vh, 3.5rem)",
        }}
      >
        <GlassyButton onClick={onStart}>I&apos;m in</GlassyButton>
      </div>

      {/* Powered-by — pinned to the very bottom of the container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55, duration: 0.5 }}
        className="relative z-10 mt-auto shrink-0 pb-5"
      >
        <Image
          src="/loreal/powered-by-astro.png"
          alt="Powered by Agentforce from Salesforce"
          width={1140}
          height={120}
          priority
          className="h-auto select-none"
          style={{ width: "min(82vw, 38vh)" }}
        />
      </motion.div>
    </div>
  );
}

function HeadlineWord({
  text,
  delay,
  fontSize = "min(26vw, 14vh)",
}: {
  text: string;
  delay: number;
  fontSize?: string;
}) {
  return (
    <motion.span
      className="block whitespace-nowrap text-center font-bold leading-[0.95] tracking-tight"
      // Scales with both viewport width AND height so it fills tall windows
      // (e.g. 1920×1080) instead of capping at the previous 7.5rem. Multi-word
      // lines (like "Find your") pass a smaller fontSize override so the
      // whole line fits without wrapping.
      style={{ fontSize }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}


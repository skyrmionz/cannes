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
          top: "calc(-1 * min(22vw, 14vh))",
          right: "calc(-1 * min(24vw, 14vh))",
          width: "min(105vw, 88vh)",
          transformOrigin: "100% 100%",
        }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loreal/umbrella.png"
          alt=""
          width={1080}
          height={1920}
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

      {/* Headline + tagline group — vertically centered between the umbrella
          spacer above and the CTA group below, so spacing is equal. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-[#001050]">
        <HeadlineWord
          text="Find your"
          delay={0.7}
          fontSize="min(18vw, 10vh)"
        />
        <HeadlineWord
          text="OOO"
          delay={0.85}
          fontSize="min(18vw, 10vh)"
        />
        <HeadlineWord
          text="Status"
          delay={1.0}
          fontSize="min(18vw, 10vh)"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
          className="mt-3 max-w-2xl text-center font-semibold leading-snug tracking-tight text-[#001050]"
          style={{ fontSize: "min(5vw, 2.6vh)" }}
        >
          We&rsquo;re at Cannes.
          <br />
          Protect your time.
        </motion.p>
      </div>

      {/* Bottom — CTA + Powered-by */}
      <div className="relative z-10 flex shrink-0 w-full flex-col items-center mt-auto">
        <div>
          <GlassyButton onClick={onStart}>I&apos;m in</GlassyButton>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="mt-6"
        >
          <Image
            src="/loreal/powered-by-astro.png"
            alt="Powered by Agentforce from Salesforce"
            width={1140}
            height={120}
            priority
            className="h-auto select-none"
            style={{ width: "min(70vw, 28vh)" }}
          />
        </motion.div>
      </div>
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


"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { TransparentVideoLoop } from "@/components/ui/transparent-video-loop";
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
        className="pointer-events-none absolute z-20 select-none"
        style={{
          top: "calc(-1 * min(20vw, 12vh))",
          right: "calc(-1 * min(34vw, 20vh))",
          width: "min(118vw, 100vh)",
          transformOrigin: "100% 100%",
        }}
        initial={{ opacity: 0, rotate: -10, x: 40 }}
        animate={{
          opacity: 1,
          x: 0,
          rotate: [-8, -6.4, -8],
        }}
        transition={{
          opacity: { duration: 0.7, delay: 0.1 },
          x: { duration: 0.7, delay: 0.1, ease: "easeOut" },
          rotate: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7,
          },
        }}
      >
        {/* Use a plain <img> so the original PNG bytes are served as-is.
            Next/Image was converting to AVIF/WebP and softening the colors +
            introducing perceptible compression artefacts on the canopy. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loreal/umbrella.png"
          alt=""
          width={1080}
          height={1920}
          draggable={false}
          className="h-auto w-full select-none"
          style={{ imageRendering: "auto" }}
        />
      </motion.div>

      {/* Spacer reserves room for the umbrella canopy so the headline never
          sits under it. Sized smaller than half the screen so the headline
          stays vertically centered between the umbrella and the CTA. */}
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: "min(46vw, 36vh)" }}
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
          text="Cannes"
          delay={0.85}
          fontSize="min(18vw, 10vh)"
        />
        <HeadlineWord
          text="Vibe"
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
          Protect your OOO time.
        </motion.p>
      </div>

      {/* Bottom — CTA, then Powered-by anchored at the bottom. */}
      <div className="relative z-10 flex shrink-0 w-full flex-col items-center">
        <div>
          <GlassyButton onClick={onStart}>Let&apos;s glow</GlassyButton>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="mt-10"
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

function GlassesGap() {
  // The glasses overlap the headline lines above and below via negative
  // margins. Margins scale with viewport height so the overlap stays
  // proportional on big screens.
  return (
    <motion.div
      className="relative z-10 flex justify-center"
      style={{
        // clamp(min, mid, max) on negative values — keeps overlap proportional
        // to viewport height but bounded on tiny + huge screens.
        marginTop: "clamp(-150px, -10vh, -60px)",
        marginBottom: "clamp(-100px, -6vh, -40px)",
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
    >
      <GlassesMedia />
    </motion.div>
  );
}

function GlassesMedia() {
  return (
    <TransparentVideoLoop
      mp4Src="/loreal/glasses-idle.mp4"
      webmSrc="/loreal/glasses-idle.webm"
      // Glasses scale with both axes so they fill space on tall windows.
      width="min(75vw, 36vh)"
      fallbackSrc="/loreal/holographic-glasses.png"
      fallbackAlt="Holographic sunglasses"
      className="select-none"
    />
  );
}

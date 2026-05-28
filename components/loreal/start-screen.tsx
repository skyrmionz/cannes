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
        paddingBottom: "clamp(2rem, 7vh, 5rem)",
      }}
    >
      {/* Top — L'Oreal wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex shrink-0 justify-center"
      >
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          className="h-auto select-none"
          style={{ width: "min(50vw, 24vh)" }}
        />
      </motion.div>

      {/* Middle — headline + inline glasses, fills the available middle space */}
      <div className="flex flex-1 flex-col items-center justify-center text-[#001050]">
        <HeadlineWord text="Find" delay={0.7} />
        <GlassesGap />
        <HeadlineWord text="your" delay={0.85} />
        <HeadlineWord text="vibe" delay={1.0} />
      </div>

      {/* Bottom — Powered-by + CTA */}
      <div className="flex shrink-0 flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Image
            src="/loreal/powered-by-astro.png"
            alt="Powered by Agentforce from Salesforce"
            width={1140}
            height={120}
            priority
            className="h-auto select-none"
            style={{ width: "min(85vw, 36vh)" }}
          />
        </motion.div>
        <GlassyButton onClick={onStart}>Claim your prize</GlassyButton>
      </div>
    </div>
  );
}

function HeadlineWord({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      className="block text-center font-bold leading-[0.95] tracking-tight"
      // Scales with both viewport width AND height so it fills tall windows
      // (e.g. 1920×1080) instead of capping at the previous 7.5rem.
      style={{ fontSize: "min(26vw, 14vh)" }}
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
      filter="drop-shadow(0 18px 40px rgba(180,140,255,0.35))"
    />
  );
}

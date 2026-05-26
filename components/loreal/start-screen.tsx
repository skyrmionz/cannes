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
export function LorealStartScreen({ onStart }: StartScreenProps) {
  return (
    <>
      {/* Top: L'Oreal wordmark */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex justify-center px-6 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          className="h-auto w-[min(42vw,180px)] select-none"
        />
      </motion.div>

      {/* Headline + inline glasses — sits just below the logo. */}
      <div className="absolute left-0 right-0 top-[18%] z-20 flex flex-col items-center gap-1 px-6 text-[#001050]">
        <motion.span
          className="block text-center font-bold leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(4.5rem, 19vw, 7.5rem)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
        >
          Find
        </motion.span>
        <motion.div
          className="relative z-10 -mt-[110px] -mb-[80px] flex justify-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
        >
          <GlassesMedia />
        </motion.div>
        <motion.span
          className="block text-center font-bold leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(4.5rem, 19vw, 7.5rem)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
        >
          your
        </motion.span>
        <motion.span
          className="block text-center font-bold leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(4.5rem, 19vw, 7.5rem)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
        >
          vibe
        </motion.span>
      </div>

      {/* Powered by Agentforce — same size as F1 (w-[min(80vw,320px)]) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex justify-center px-6"
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
          className="h-auto w-[min(80vw,320px)] select-none"
        />
      </motion.div>

      {/* CTA — pinned at bottom-14 to match F1's "Start your engine" placement */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-6">
        <GlassyButton onClick={onStart}>Let&apos;s glow</GlassyButton>
      </div>
    </>
  );
}

function GlassesMedia() {
  return (
    <TransparentVideoLoop
      mp4Src="/loreal/glasses-idle.mp4"
      webmSrc="/loreal/glasses-idle.webm"
      width="min(60vw, 300px)"
      fallbackSrc="/loreal/holographic-glasses.png"
      fallbackAlt="Holographic sunglasses"
      className="select-none"
      filter="drop-shadow(0 18px 40px rgba(180,140,255,0.35))"
    />
  );
}


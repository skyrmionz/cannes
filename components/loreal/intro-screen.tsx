"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { CornerTap } from "@/components/ui/corner-tap";
import { GlassyButton } from "./glassy-button";

interface IntroScreenProps {
  onStart: () => void;
}

const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

export function LorealIntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: LOREAL_GRADIENT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Glass card — same treatment as start screen */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[40px]"
        style={{
          WebkitBackdropFilter: "blur(10px) saturate(120%)",
          backdropFilter: "blur(10px) saturate(120%)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.16) 100%)",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.45) inset",
            "0 1px 0 rgba(255,255,255,0.65) inset",
            "0 18px 50px rgba(120,160,220,0.18)",
          ].join(", "),
        }}
      />

      {/* Corner tap → /f1 still works on this screen */}
      <CornerTap to="/f1" />

      {/* Content column */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-between px-8 py-10">
        {/* Top stack: greeting → astro → tagline → divider → body copy */}
        <div className="flex w-full max-w-md flex-col items-center gap-5 text-center text-[#001050]">
          <motion.h1
            className="font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 8vw, 2.75rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          >
            Coucou, I&apos;m Agent Astro.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/loreal/agent-astro.png"
              alt="Agent Astro"
              width={1200}
              height={1200}
              priority
              className="h-auto w-[min(56vw,260px)] select-none"
              style={{ filter: "drop-shadow(0 18px 40px rgba(60,120,240,0.3))" }}
            />
          </motion.div>

          <motion.p
            className="font-semibold leading-snug tracking-tight"
            style={{ fontSize: "clamp(1.05rem, 4.4vw, 1.5rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          >
            I&apos;ll be your La Croisette vibe analyzer!
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="w-full px-2"
          >
            <Image
              src="/loreal/divider-line.png"
              alt=""
              width={1200}
              height={4}
              className="h-auto w-full select-none opacity-80"
            />
          </motion.div>

          <motion.p
            className="text-[#001050]/85 leading-snug tracking-tight"
            style={{ fontSize: "clamp(0.95rem, 3.8vw, 1.05rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
          >
            We&apos;ll use L&apos;Oréal beauty data and Salesforce intelligence
            to find your vibe. Oh, and you&apos;ll get a little gift on your way out!
          </motion.p>
        </div>

        {/* Bottom: glassy CTA */}
        <GlassyButton onClick={onStart} delay={0.95}>
          Time to vibe
        </GlassyButton>
      </div>
    </motion.div>
  );
}

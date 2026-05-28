"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 5000;
const RING_COUNT = 4;
const RING_DURATION_S = 2.6;

// Buffer screen between agenda question and persona reveal. Holds for 3s,
// then `onComplete` advances. The exit upward-fade is handled by the parent
// AnimatePresence variant in app/loreal/page.tsx — this component only owns
// the in-screen content + animations.
export function LorealAgentforceBufferScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, HOLD_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
      {/* Title block — three lines, each on its own row, centered. */}
      <div className="flex shrink-0 flex-col items-center gap-1 text-center text-[#001050]">
        <TitleLine text="You answered." delay={0.05} />
        <TitleLine text="We listened." delay={0.2} />
        <TitleLine text={"Because you’re worth it."} delay={0.35} />
      </div>

      {/* Astro framed by pulsating outward gold rings. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "min(55vw, 32vh)", aspectRatio: "1 / 1" }}
        >
          {/* Soft static glow — anchors the rings so the halo never reads empty. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(245,220,161,0.35) 0%, rgba(226,183,116,0.18) 45%, rgba(226,183,116,0) 75%)",
              filter: "blur(8px)",
            }}
          />
          {Array.from({ length: RING_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(232, 195, 130, 0.7)",
                boxShadow:
                  "0 0 18px rgba(232,195,130,0.35), 0 0 0 1px rgba(245,220,161,0.4) inset",
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.7],
                opacity: [0, 0.55, 0.55, 0],
              }}
              transition={{
                duration: RING_DURATION_S,
                times: [0, 0.18, 0.7, 1],
                repeat: Infinity,
                ease: "linear",
                delay: (i * RING_DURATION_S) / RING_COUNT,
              }}
            />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            className="relative"
            style={{ width: "78%", height: "78%" }}
          >
            <Image
              src="/loreal/agent-astro.png"
              alt="Agent Astro"
              fill
              priority
              draggable={false}
              className="select-none object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Subtitle — three short lines. */}
      <motion.p
        className="w-full max-w-2xl shrink-0 px-2 text-center leading-snug text-[#001050]/80"
        style={{
          fontSize: "clamp(0.85rem, min(3vw, 2vh), 1.1rem)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 500,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
      >
        L&rsquo;Oréal uses Agentforce to bring you data-backed skincare.
        <br />
        Salesforce delivers personalized moments like this for companies
        everyday.
      </motion.p>
    </div>
  );
}

function TitleLine({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      className="block font-bold leading-[1.05] tracking-tight"
      style={{ fontSize: "clamp(1.4rem, min(7.5vw, 5.5vh), 3rem)" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      {text}
    </motion.span>
  );
}

"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 3000;
const RING_COUNT = 3;
const RING_DURATION_S = 1.8;

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
    <div className="relative flex h-full w-full flex-col items-center justify-between px-6 py-12">
      {/* Title block — three lines, each on its own row, centered. */}
      <div className="flex shrink-0 flex-col items-center gap-1 text-center text-[#001050]">
        <TitleLine text="You answered." delay={0.05} />
        <TitleLine text="We listened." delay={0.2} />
        <TitleLine text={"Because you’re worth it."} delay={0.35} />
      </div>

      {/* Astro framed by pulsating outward gold rings. */}
      <div className="relative flex flex-1 items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "min(60vw, 36vh)", aspectRatio: "1 / 1" }}
        >
          {Array.from({ length: RING_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                border: "3px solid rgba(226, 183, 116, 0.85)",
                boxShadow:
                  "0 0 24px rgba(226,183,116,0.45), 0 0 0 1px rgba(245,220,161,0.55) inset",
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.7], opacity: [0.65, 0] }}
              transition={{
                duration: RING_DURATION_S,
                repeat: Infinity,
                ease: "easeOut",
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
              style={{
                filter: "drop-shadow(0 18px 40px rgba(60,120,240,0.3))",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Subtitle — three short lines. */}
      <motion.p
        className="shrink-0 max-w-2xl text-center leading-snug text-[#001050]/80"
        style={{
          fontSize: "clamp(0.95rem, min(3.4vw, 2.2vh), 1.15rem)",
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
      style={{ fontSize: "clamp(1.6rem, min(8vw, 6vh), 3.2rem)" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      {text}
    </motion.span>
  );
}

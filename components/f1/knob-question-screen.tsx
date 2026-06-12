"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { DotBg } from "./dot-bg";
import { OptionGrid } from "./option-grid";

export interface KnobOption {
  id: string;
  label: string;
  subtitle?: string;
  description: string;
  image?: string;
  emoji?: string;
  logo?: string;
  drivers?: string;
  character?: boolean;
  melodyGroup?: string;
  musicNote?: string;
}

interface KnobQuestionScreenProps {
  title: string;
  subtitle: string;
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
  progressImage: string;
  sessionId?: string | null;
}

// Per-question screen entrance personalities
const personalities = [
  // Q1 — drums: hard lateral shunt like a grid start
  {
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
  // Q2 — team: scale up from centre, logo-wheel feel
  {
    initial: { scale: 0.93, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.42, ease: [0.34, 1.4, 0.64, 1] as const },
  },
  // Q3 — celebration: fly up like a podium leap
  {
    initial: { y: 56, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] as const },
  },
];


export function KnobQuestionScreen({
  title,
  subtitle,
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
  stepIndex,
  totalSteps,
  progressImage,
  sessionId,
}: KnobQuestionScreenProps) {
  const p = personalities[stepIndex % personalities.length];
  const completedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (completedRef.current || !sessionId) return;
      fetch(`/api/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screen_dropped: stepIndex }),
      }).catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    completedRef.current = true;
    onNext();
  };

  return (
    <motion.div
      className="relative flex h-screen flex-col overflow-hidden"
      initial={p.initial}
      animate={p.animate}
      transition={p.transition}
    >
      <DotBg />

      {/* Progress bar image */}
      <motion.div
        className="relative z-10 mx-auto mt-9"
        style={{ width: "67.5%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Image src={progressImage} alt="" width={1637} height={180} unoptimized className="w-full" />
      </motion.div>

      {/* Question header */}
      <div className="relative z-10 px-8 pt-4">
        <motion.h2
          className="font-extrabold leading-tight text-white text-center"
          style={{ fontSize: 88, paddingLeft: 45 }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06, duration: 0.34 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-3 text-center text-white"
          style={{ fontSize: 40 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.32 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Option grid */}
      <div className="relative z-10 flex flex-1 flex-col justify-center py-2">
        <OptionGrid
          options={options}
          selectedId={selectedId}
          onSelect={onSelect}
          stepIndex={stepIndex}
        />
      </div>

      {/* Hint */}
      <p className="relative z-10 text-center text-white font-bold pb-2 whitespace-pre-line" style={{ fontSize: 44 }}>
        {stepIndex === 1 ? "Select your reaction\nand click next" : "Select your answer\nand click next"}
      </p>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between px-6 pb-10 pt-2">
        <motion.button
          onClick={onBack}
          style={{ background: "none", border: "none", padding: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ delay: 0.22 }}
        >
          <Image src="/f1/Buttons/Back.png" alt="Back" width={120} height={120} unoptimized />
        </motion.button>

        <motion.button
          onClick={selectedId ? handleNext : undefined}
          style={{ background: "none", border: "none", padding: 0, cursor: selectedId ? "pointer" : "default" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedId ? 1 : 0.4 }}
          whileTap={selectedId ? { scale: 0.95 } : {}}
          transition={{ delay: 0.22, duration: 0.3 }}
        >
          <Image src="/f1/Buttons/Next.png" alt="Next" width={300} height={120} unoptimized />
        </motion.button>
      </div>
    </motion.div>
  );
}

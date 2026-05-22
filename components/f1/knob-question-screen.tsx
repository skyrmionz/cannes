"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogoHeader } from "./logo-header";
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
  sessionId?: string | null;
}

// Per-question entrance personalities
const personalities = [
  // Q1 — drums: pulse in like a kick hit
  { initial: { scale: 1.04, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
  // Q2 — bass: fast upward surge
  { initial: { y: 44, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.36, ease: [0.32, 0.72, 0, 1] as const } },
  // Q3 — melody: grand fan-in
  { initial: { y: 24, opacity: 0, rotateX: 6 }, animate: { y: 0, opacity: 1, rotateX: 0 }, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
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
  sessionId,
}: KnobQuestionScreenProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const p = personalities[stepIndex % personalities.length];
  const completedRef = useRef(false);

  // Drop-off tracking — fires on unmount if user didn't complete this screen
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

      {/* Top-left stripe chrome */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 w-32 opacity-70">
        <Image src="/f1/stripe-top-left.png" alt="" width={128} height={128} unoptimized className="object-contain" />
      </div>
      {/* Bottom-right stripe chrome */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 w-32 opacity-70">
        <Image src="/f1/stripe-bottom-right.png" alt="" width={128} height={128} unoptimized className="object-contain" />
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-1 w-full bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

      {/* Question header */}
      <div className="relative z-10 px-5 pt-3">
        <motion.h2
          className="text-xl font-extrabold uppercase leading-tight tracking-tight text-white"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06, duration: 0.32 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-0.5 text-[11px] text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14, duration: 0.32 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Option grid — fills remaining vertical space */}
      <div className="relative z-10 flex flex-1 flex-col justify-center py-2">
        <OptionGrid options={options} selectedId={selectedId} onSelect={onSelect} />
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-4 pb-6 pt-2">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.3 }}
        >
          {/* Back — text only, subtle */}
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-[0.15em] text-white/50 transition-colors hover:text-white"
          >
            Back
          </button>

          {/* Next — cyan circle arrow, Figma-style */}
          <AnimatePresence>
            {selectedId && (
              <motion.button
                onClick={handleNext}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #00D4FF 0%, #0094CC 100%)",
                  boxShadow: "0 4px 20px rgba(0,179,255,0.5)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M8 11H14M14 11L11 8M14 11L11 14" stroke="#001050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

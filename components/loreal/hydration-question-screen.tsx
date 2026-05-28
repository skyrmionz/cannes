"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronRight, ChevronLeft, Plus, Minus } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";
import {
  HydrationDroplet,
  type DropletLevel,
  type DropletPhase,
} from "./hydration-droplet";
import { RoundIconButton } from "./round-icon-button";

interface Props {
  onNext: () => void;
  onBack: () => void;
  value: DropletLevel;
  onChange: (next: DropletLevel) => void;
}

export function LorealHydrationQuestionScreen({
  onNext,
  onBack,
  value,
  onChange,
}: Props) {
  const level = value;
  const [phase, setPhase] = useState<DropletPhase>("idle");
  const [fromLevel, setFromLevel] = useState<DropletLevel>(value);
  const [toLevel, setToLevel] = useState<DropletLevel>(value);

  const onPlus = useCallback(() => {
    if (phase !== "idle" || level >= 2) return;
    const next = (level + 1) as DropletLevel;
    setFromLevel(level);
    setToLevel(next);
    setPhase("transitioning");
  }, [level, phase]);

  const onMinus = useCallback(() => {
    if (phase !== "idle" || level <= 0) return;
    const next = (level - 1) as DropletLevel;
    setFromLevel(level);
    setToLevel(next);
    setPhase("transitioning");
  }, [level, phase]);

  const onTransitionEnd = useCallback(() => {
    onChange(toLevel);
    setPhase("idle");
  }, [toLevel, onChange]);

  return (
    <div className="absolute inset-3 overflow-hidden rounded-[40px]">
      {/* Stack: header / droplet / buttons. The droplet sits in a flex-1
          region whose vertical gap is split equally above and below by
          flex-col + justify-between, so text→droplet ≡ droplet→buttons. */}
      <div className="relative z-30 flex h-full flex-col px-7 pt-7 pb-28">
        <div className="shrink-0">
          <LorealProgressBar percent={40} label="40% to glow" />

          <motion.h1
            className="mt-10 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
            style={{ fontSize: "clamp(1.75rem, 6.5vw, 2.4rem)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          >
            Be honest: how hydrated are you?
          </motion.h1>

          <motion.p
            className="mt-2 text-center leading-snug text-[#001050]/75"
            style={{
              fontSize: "clamp(0.85rem, 3.4vw, 0.95rem)",
              fontFamily:
                'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
          >
            L&apos;Oréal labs say dehydration encourages fine lines. I&apos;ll
            calculate your bounce-back time.
          </motion.p>
        </div>

        {/* Droplet + buttons region — flex-1 with justify-between leaves
            equal slack above the droplet and below it (above the buttons). */}
        <div className="flex flex-1 flex-col items-center justify-between">
          <div aria-hidden />
          <HydrationDroplet
            width="min(82vw, 56vh)"
            level={level}
            phase={phase}
            fromLevel={fromLevel}
            toLevel={toLevel}
            onTransitionEnd={onTransitionEnd}
          />
          <div className="flex items-center gap-8">
            <RoundIconButton
              onClick={onMinus}
              disabled={phase !== "idle" || level <= 0}
              ariaLabel="Decrease hydration"
            >
              <Minus className="h-6 w-6" strokeWidth={3} />
            </RoundIconButton>
            <RoundIconButton
              onClick={onPlus}
              disabled={phase !== "idle" || level >= 2}
              ariaLabel="Increase hydration"
            >
              <Plus className="h-6 w-6" strokeWidth={3} />
            </RoundIconButton>
          </div>
        </div>
      </div>

      {/* Back button — bottom-left, mirrors the next button */}
      <motion.button
        type="button"
        onClick={onBack}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="absolute bottom-8 left-6 z-30 grid h-14 w-14 place-items-center rounded-full"
        style={{
          background: "rgba(255,255,255,0.55)",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.7) inset",
            "0 1px 0 rgba(255,255,255,0.85) inset",
            "0 8px 18px rgba(120,160,220,0.25)",
          ].join(", "),
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          backdropFilter: "blur(10px) saturate(140%)",
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        aria-label="Back"
      >
        <ChevronLeft className="h-6 w-6 text-[#001050]" strokeWidth={3} />
      </motion.button>

      {/* Next button — bottom-right */}
      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="absolute bottom-8 right-6 z-30 grid h-14 w-14 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)",
          boxShadow: [
            "0 1px 0 rgba(255,255,255,0.45) inset",
            "0 -1px 0 rgba(0,16,80,0.25) inset",
            "0 0 0 1px rgba(255,255,255,0.25) inset",
            "0 12px 28px rgba(15,84,200,0.4)",
          ].join(", "),
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6 text-white" strokeWidth={3} />
      </motion.button>
    </div>
  );
}

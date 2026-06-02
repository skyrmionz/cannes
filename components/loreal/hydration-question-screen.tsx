"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { LorealProgressBar } from "./progress-bar";
import {
  HydrationDroplet,
  type DropletLevel,
  type DropletPhase,
} from "./hydration-droplet";
import { useElementSize } from "@/lib/use-element-size";

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

  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const dropletPx = Math.max(
    140,
    Math.min(bodySize.h - 40, bodySize.w * 0.75, 640),
  );

  const goToLevel = useCallback(
    (next: DropletLevel) => {
      if (phase !== "idle" || next === level) return;
      setFromLevel(level);
      setToLevel(next);
      setPhase("transitioning");
    },
    [level, phase],
  );

  const onTransitionEnd = useCallback(() => {
    onChange(toLevel);
    setPhase("idle");
  }, [toLevel, onChange]);

  const canGoUp = phase === "idle" && level < 2;
  const canGoDown = phase === "idle" && level > 0;

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={50} label="50% to glow" />
        <motion.h1
          className="mt-12 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.8rem, min(9vw, 6vh), 3.2rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          Be honest:
          <br />
          how hydrated are you?
        </motion.h1>
        <motion.p
          className="mt-3 text-center leading-snug text-[#001050]/75"
          style={{
            fontSize: "clamp(1.05rem, min(4.5vw, 2.8vh), 1.35rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          Calculating your energy reserves for Cannes Week.
        </motion.p>
      </div>

      {/* Body — stacked up/down glass buttons on the left, droplet on the right */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 items-center justify-center gap-6 px-8"
      >
        {/* Stacked level buttons */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <LevelButton
            direction="up"
            disabled={!canGoUp}
            onClick={() => goToLevel((level + 1) as DropletLevel)}
          />
          <LevelButton
            direction="down"
            disabled={!canGoDown}
            onClick={() => goToLevel((level - 1) as DropletLevel)}
          />
        </div>

        {/* Droplet */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <HydrationDroplet
            width={`${dropletPx}px`}
            level={level}
            phase={phase}
            fromLevel={fromLevel}
            toLevel={toLevel}
            onTransitionEnd={onTransitionEnd}
          />
        </div>
      </div>

      {/* Footer — glassy Back + Next text buttons */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-6 pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full font-semibold text-[#001050] tracking-tight"
          style={{
            paddingInline: "clamp(2rem, 6vw, 3.5rem)",
            paddingBlock: "clamp(0.85rem, 2.2vh, 1.5rem)",
            fontSize: "clamp(1.1rem, min(4.2vw, 3vh), 1.5rem)",
            background: "rgba(255,255,255,0.45)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.6) inset",
              "0 1px 0 rgba(255,255,255,0.8) inset",
              "0 8px 24px rgba(120,160,220,0.2)",
            ].join(", "),
            WebkitBackdropFilter: "blur(12px) saturate(140%)",
            backdropFilter: "blur(12px) saturate(140%)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full font-semibold text-[#001050] tracking-tight"
          style={{
            paddingInline: "clamp(2rem, 6vw, 3.5rem)",
            paddingBlock: "clamp(0.85rem, 2.2vh, 1.5rem)",
            fontSize: "clamp(1.1rem, min(4.2vw, 3vh), 1.5rem)",
            background: "rgba(255,255,255,0.45)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.6) inset",
              "0 1px 0 rgba(255,255,255,0.8) inset",
              "0 8px 24px rgba(120,160,220,0.2)",
            ].join(", "),
            WebkitBackdropFilter: "blur(12px) saturate(140%)",
            backdropFilter: "blur(12px) saturate(140%)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}

function LevelButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const path = direction === "up" ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6";
  const gradientId = `hydration-arrow-${direction}`;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.06 } : undefined}
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      className="relative grid place-items-center rounded-3xl disabled:cursor-not-allowed"
      style={{
        width: 72,
        height: 72,
        background: "rgba(255,255,255,0.45)",
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.7) inset",
          "0 1px 0 rgba(255,255,255,0.85) inset",
          "0 10px 26px rgba(120,160,220,0.22)",
        ].join(", "),
        WebkitBackdropFilter: "blur(14px) saturate(150%)",
        backdropFilter: "blur(14px) saturate(150%)",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 0.25s ease",
      }}
      aria-label={direction === "up" ? "Increase hydration" : "Decrease hydration"}
    >
      {/* SVG with linear blue gradient stroke */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7FC4FF" />
            <stop offset="55%" stopColor="#1A6CF0" />
            <stop offset="100%" stopColor="#0F3B8C" />
          </linearGradient>
        </defs>
        <path
          d={path}
          stroke={`url(#${gradientId})`}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

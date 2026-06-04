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
  // Responsive button size: smaller on phones so they don't dominate the body
  // region. Same value drives both the absolute-positioned button and the
  // droplet's "reserve" math, so they always agree.
  const buttonSize = Math.max(64, Math.min(110, bodySize.w * 0.18));
  // Each button column = left offset (16) + button + gap to droplet (16) = 32 + button
  const buttonReserve = 32 + buttonSize;
  const dropletPx = Math.max(
    120,
    Math.min(
      bodySize.h - 24,
      Math.max(120, bodySize.w - buttonReserve * 2),
      640,
    ),
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

      {/* Body — droplet centered in the body; up/down buttons absolutely
          positioned on the left so they don't shift the droplet's center. */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 items-center justify-center"
      >
        {/* Droplet — centered in the body region */}
        <HydrationDroplet
          width={`${dropletPx}px`}
          level={level}
          phase={phase}
          fromLevel={fromLevel}
          toLevel={toLevel}
          onTransitionEnd={onTransitionEnd}
        />

        {/* Stacked level buttons — absolutely pinned to the left edge,
            vertically centered. Outside the centering flow so they don't
            push the droplet right. */}
        <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
          <LevelButton
            direction="up"
            size={buttonSize}
            disabled={!canGoUp}
            onClick={() => goToLevel((level + 1) as DropletLevel)}
          />
          <LevelButton
            direction="down"
            size={buttonSize}
            disabled={!canGoDown}
            onClick={() => goToLevel((level - 1) as DropletLevel)}
          />
        </div>
      </div>

      {/* Hint text below the droplet — mirrors the sun question's hint */}
      <motion.p
        className="relative z-30 shrink-0 text-center font-bold tracking-tight text-[#001050]/60 px-7"
        style={{ fontSize: "clamp(1rem, min(5vw, 3vh), 1.5rem)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Fill the water droplet and click Next
      </motion.p>

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
  size,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  size: number;
  disabled: boolean;
  onClick: () => void;
}) {
  // Full arrows (shaft + head), not bare chevrons. Drawn vertically so the
  // up arrow points up and the down arrow points down, like ↑ / ↓.
  const path =
    direction === "up"
      ? "M12 20 L12 6 M5 13 L12 6 L19 13"
      : "M12 4 L12 18 M5 11 L12 18 L19 11";
  const gradientId = `hydration-arrow-${direction}`;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.06 } : undefined}
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      className="relative grid place-items-center rounded-[28px] disabled:cursor-not-allowed"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.45)",
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.7) inset",
          "0 1px 0 rgba(255,255,255,0.85) inset",
          "0 12px 30px rgba(120,160,220,0.25)",
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
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
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

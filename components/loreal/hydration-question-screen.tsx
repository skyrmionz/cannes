"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { LorealProgressBar } from "./progress-bar";
import {
  HydrationDroplet,
  type DropletLevel,
  type DropletPhase,
} from "./hydration-droplet";
import { useElementSize } from "@/lib/use-element-size";
import {
  FOOTER_BUTTON_STYLE,
  HINT_TEXT_CLASS,
  HINT_TEXT_FONT_SIZE,
  SUBTITLE_FONT_SIZE,
  TITLE_MARGIN_TOP,
} from "./question-shell";

interface Props {
  onNext: () => void;
  onBack: () => void;
  value: DropletLevel;
  onChange: (next: DropletLevel) => void;
}

// Pixels of vertical pointer travel required to register a swipe up/down.
const SWIPE_THRESHOLD = 30;

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
  // Droplet fills the body region — bounded only by available width
  // (with a small horizontal buffer) and available height (with a tiny
  // vertical buffer). No hard pixel cap so the droplet scales up on
  // tall kiosks (1080×1920) instead of stranding 600+ vertical pixels
  // of empty space in the body.
  const dropletPx = Math.max(
    140,
    Math.min(bodySize.h - 80, bodySize.w - 120),
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

  // Swipe handling — pointer down on the droplet captures origin Y; pointer
  // up resolves direction & magnitude. Disabled while a fill animation is
  // running (phase !== "idle") so swipes can't queue mid-transition.
  const startY = useRef<number | null>(null);
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "idle") return;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startY.current;
    startY.current = null;
    if (start == null || phase !== "idle") return;
    const dy = e.clientY - start;
    if (Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (dy < 0) {
      // Swipe up → fill (level goes up by 1, capped at 2).
      if (level < 2) goToLevel((level + 1) as DropletLevel);
    } else {
      // Swipe down → empty (level goes down by 1, floored at 0).
      if (level > 0) goToLevel((level - 1) as DropletLevel);
    }
  };
  const handlePointerCancel = () => {
    startY.current = null;
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-20">
        <LorealProgressBar percent={50} label="50%" />
        <motion.h1
          className="text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{
            fontSize: "min(7vw, 4.4vh)",
            marginTop: TITLE_MARGIN_TOP,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          Be honest:
          <br />
          how hydrated are you?
        </motion.h1>
        <motion.p
          className="mt-3 text-center leading-snug text-[#001050]/85"
          style={{
            fontSize: SUBTITLE_FONT_SIZE,
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          Calculating your energy reserves for Cannes Week.
        </motion.p>
      </div>

      {/* Body — droplet centered. Pointer events on the droplet wrapper
          drive swipe-up-to-fill / swipe-down-to-empty. */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 items-center justify-center"
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            touchAction: "none",
            cursor: phase === "idle" ? "grab" : "default",
            width: dropletPx,
          }}
        >
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

      {/* Hint text below the droplet */}
      <motion.p
        className={HINT_TEXT_CLASS}
        style={{ fontSize: HINT_TEXT_FONT_SIZE }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Slide your finger on the droplet
        <br />
        and click Next
      </motion.p>

      {/* Footer — glassy Back + Next text buttons */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-8 pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full font-semibold text-[#001050] tracking-tight"
          style={FOOTER_BUTTON_STYLE}
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
          style={FOOTER_BUTTON_STYLE}
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

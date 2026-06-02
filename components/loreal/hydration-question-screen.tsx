"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
  // Droplet fills most of the body height on tall screens (1080x1920)
  const dropletPx = Math.max(
    140,
    Math.min(bodySize.h - 40, bodySize.w * 0.85, 640),
  );

  // Vertical bar height matches the droplet area
  const barH = Math.max(100, dropletPx * 0.85);

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

  // Notch positions: 0 = bottom, 1 = middle, 2 = top
  const notchPositions = [0, barH * 0.5, barH] as const;

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={50} label="50% to glow" />
        <motion.h1
          className="mt-8 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
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

      {/* Body — vertical bar on left + droplet on right */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 items-center justify-center gap-6 px-8"
      >
        {/* Vertical progress bar with notch */}
        <div className="relative flex flex-col items-center" style={{ height: barH }}>
          {/* Bar track */}
          <div
            className="relative rounded-full"
            style={{
              width: 28,
              height: barH,
              background: "rgba(255, 255, 255, 0.7)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.8) inset, 0 4px 16px rgba(120,160,220,0.15)",
            }}
          >
            {/* Fill from bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ease-out"
              style={{
                height: `${(level / 2) * 100}%`,
                background:
                  "linear-gradient(180deg, rgba(80,200,255,0.8) 0%, rgba(140,220,255,0.4) 100%)",
              }}
            />
          </div>

          {/* Notch indicators — tappable circles */}
          {([0, 1, 2] as DropletLevel[]).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToLevel(i)}
              disabled={phase !== "idle"}
              className="absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
              style={{
                bottom: `${notchPositions[i] - 14}px`,
                width: 28,
                height: 28,
                background:
                  level === i
                    ? "linear-gradient(180deg, #ffffff 0%, #4ec8f7 100%)"
                    : "rgba(255,255,255,0.6)",
                boxShadow:
                  level === i
                    ? "0 0 8px 2px rgba(78,200,247,0.4), 0 2px 6px rgba(0,0,0,0.1)"
                    : "0 1px 4px rgba(0,0,0,0.08)",
                transform: `translateX(-50%) scale(${level === i ? 1.3 : 1})`,
              }}
            />
          ))}
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

      {/* Footer — back left, next right */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-6 pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="grid h-14 w-14 place-items-center rounded-full"
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
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="grid h-14 w-14 place-items-center rounded-full"
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
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6 text-[#001050]" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}

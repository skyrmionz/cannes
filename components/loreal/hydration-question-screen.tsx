"use client";

import { useState, useCallback } from "react";
import { motion, useMotionValue, animate } from "motion/react";
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
    Math.min(bodySize.h - 40, bodySize.w * 0.85, 640),
  );

  const barH = Math.max(100, dropletPx * 0.85);
  const stopPositions = [0, barH * 0.5, barH] as const;
  const y = useMotionValue<number>(-stopPositions[value]);

  const goToLevel = useCallback(
    (next: DropletLevel) => {
      if (phase !== "idle" || next === level) return;
      setFromLevel(level);
      setToLevel(next);
      setPhase("transitioning");
      animate(y, -stopPositions[next], {
        duration: 0.55,
        ease: [0.32, 0.72, 0, 1],
      });
    },
    [level, phase, y, stopPositions],
  );

  const handleDragEnd = useCallback(() => {
    if (phase !== "idle") return;
    const current = y.get();
    let closest: DropletLevel = 0;
    let bestDist = Infinity;
    for (let i = 0; i < stopPositions.length; i++) {
      const d = Math.abs(-stopPositions[i] - current);
      if (d < bestDist) {
        bestDist = d;
        closest = i as DropletLevel;
      }
    }
    if (closest !== level) {
      setFromLevel(level);
      setToLevel(closest);
      setPhase("transitioning");
    }
    animate(y, -stopPositions[closest], {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1],
    });
  }, [level, phase, y, stopPositions]);

  const onTransitionEnd = useCallback(() => {
    onChange(toLevel);
    setPhase("idle");
  }, [toLevel, onChange]);

  const dragBounds = {
    top: -stopPositions[2],
    bottom: -stopPositions[0],
  };

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

      {/* Body — vertical bar on left + droplet on right */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 items-center justify-center gap-6 px-8"
      >
        {/* Vertical progress bar with single draggable notch */}
        <div className="relative flex flex-col items-center" style={{ height: barH }}>
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

          {/* Draggable notch — white-to-blue gradient circle */}
          <motion.div
            className="absolute left-1/2 z-10"
            style={{
              y,
              bottom: 0,
              marginLeft: -20,
              cursor: "grab",
            }}
            drag="y"
            dragConstraints={dragBounds}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing", scale: 1.15 }}
          >
            <div
              className="rounded-full"
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(180deg, #ffffff 0%, #4ec8f7 100%)",
                boxShadow:
                  "0 0 10px 3px rgba(78,200,247,0.35), 0 2px 8px rgba(0,0,0,0.12)",
              }}
            />
          </motion.div>
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

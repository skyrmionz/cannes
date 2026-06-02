"use client";

import { motion, useMotionValue, animate } from "motion/react";
import Image from "next/image";
import { LorealProgressBar } from "./progress-bar";
import { GlassyButton } from "./glassy-button";
import { useElementSize } from "@/lib/use-element-size";
import { useEffect, useMemo } from "react";

type StopIndex = 0 | 1 | 2;

interface Props {
  onNext: () => void;
  value: StopIndex;
  onChange: (next: StopIndex) => void;
}


export function LorealSunQuestionScreen({ onNext, value, onChange }: Props) {
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyH = bodySize.h;

  // The sun travels along a vertical white bar. Three stops are spaced evenly.
  // Stop 0 = bottom, stop 2 = top.
  const barH = Math.max(100, bodyH * 0.6);
  const barPad = 20; // internal padding so the sun doesn't touch bar edges
  const travelH = barH - barPad * 2;

  // Sun size scales with the body
  const sunPx = useMemo(
    () => Math.max(120, Math.min(bodyH * 0.42, 320)),
    [bodyH],
  );

  const stopPositions = [0, travelH * 0.5, travelH] as const;
  const y = useMotionValue<number>(0);

  // Snap on geometry change
  useEffect(() => {
    y.set(-stopPositions[value]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyH]);

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(y, -stopPositions[i], {
      duration: 0.55,
      ease: [0.32, 0.72, 0, 1],
    });
  };

  const handleDragEnd = () => {
    const current = y.get();
    let closest: StopIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < stopPositions.length; i++) {
      const d = Math.abs(-stopPositions[i] - current);
      if (d < bestDist) {
        bestDist = d;
        closest = i as StopIndex;
      }
    }
    goToStop(closest);
  };

  const dragBounds = {
    top: -stopPositions[2],
    bottom: -stopPositions[0],
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-10">
        <LorealProgressBar percent={25} label="25% to glow" />
        <motion.h1
          className="mt-8 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.8rem, min(9vw, 6vh), 3.2rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          Sun worshipper or
          <br />
          shade seeker?
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
          Your threshold just became my first data point.
        </motion.p>
      </div>

      {/* Body — vertical white bar with draggable sun */}
      <div ref={bodyRef} className="relative min-h-0 flex-1 flex items-center justify-center">
        {/* White vertical progress bar */}
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
          {/* Fill — grows from the bottom up to the sun position */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ease-out"
            style={{
              height: `${((value / 2) * 100)}%`,
              background:
                "linear-gradient(180deg, rgba(255,180,50,0.8) 0%, rgba(255,220,100,0.4) 100%)",
            }}
          />
        </div>

        {/* Sun icon — draggable along the bar */}
        <motion.div
          className="absolute z-40"
          drag="y"
          dragConstraints={dragBounds}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            y,
            bottom: barPad + (bodyH - barH) / 2,
            cursor: "grab",
          }}
          whileTap={{ cursor: "grabbing" }}
        >
          <Image
            src="/loreal/icon-sun.png"
            alt="Sun"
            width={400}
            height={400}
            priority
            draggable={false}
            className="select-none"
            style={{
              width: `${sunPx}px`,
              height: "auto",
            }}
          />
        </motion.div>

      </div>

      {/* Hint text */}
      <motion.p
        className="relative z-30 shrink-0 text-center text-[#001050]/60"
        style={{
          fontSize: "clamp(0.8rem, min(3.2vw, 2vh), 0.95rem)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Slide the sun and click Next
      </motion.p>

      {/* Footer */}
      <div className="relative z-30 flex shrink-0 items-center justify-end px-6 pb-8 pt-2">
        <GlassyButton onClick={onNext} delay={0.5}>
          Next
        </GlassyButton>
      </div>
    </div>
  );
}

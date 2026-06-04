"use client";

import { motion, useMotionValue, animate } from "motion/react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";
import { useEffect, useMemo } from "react";

type StopIndex = 0 | 1 | 2;

interface Props {
  onNext: () => void;
  onBack?: () => void;
  value: StopIndex;
  onChange: (next: StopIndex) => void;
}

// Exponential-plateau curve: y(t) = 1 - exp(-k*t), normalized to [0,1].
// Larger k → faster initial rise, longer plateau toward the end. The curve
// gives the path a gentle hump on the left and flattens out to the right.
const PLATEAU_K = 3.4;
function plateau(t: number): number {
  const norm = 1 - Math.exp(-PLATEAU_K);
  return (1 - Math.exp(-PLATEAU_K * t)) / norm;
}

// Glow intensity per stop. Stop 0 = subtle, stop 2 = brightest.
const SUN_GLOWS: Record<StopIndex, string> = {
  0: [
    "0 0 24px rgba(255,210,140,0.35)",
    "0 0 60px rgba(255,200,120,0.18)",
  ].join(", "),
  1: [
    "0 0 40px rgba(255,210,120,0.55)",
    "0 0 110px rgba(255,200,100,0.35)",
    "0 0 180px rgba(255,180,80,0.2)",
  ].join(", "),
  2: [
    "0 0 60px rgba(255,225,150,0.85)",
    "0 0 140px rgba(255,200,100,0.7)",
    "0 0 240px rgba(255,170,60,0.5)",
    "0 0 360px rgba(255,150,40,0.3)",
  ].join(", "),
};

export function LorealSunQuestionScreen({ onNext, onBack, value, onChange }: Props) {
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w;
  const bodyH = bodySize.h;

  // Path geometry. The plateau spans most of the body width, with side
  // padding so the sun never gets clipped. Vertical span is the curve's
  // travel — sun starts low-left and ends high-right.
  const sidePad = 80;
  const pathW = Math.max(160, bodyW - sidePad * 2);
  const verticalSpan = Math.max(120, bodyH * 0.55);

  // Sun size scales off body height but stays smaller than before so it
  // sits cleanly on the curve.
  const sunPx = useMemo(
    () => Math.max(140, Math.min(bodyH * 0.42, 360)),
    [bodyH],
  );

  // Compute the (x, y) of each stop along the plateau curve. Stop 0 is the
  // left/low end; stop 2 is the right/high (plateau) end. y is measured
  // from the curve's baseline upward — final CSS uses these as offsets
  // from the body's bottom-center.
  const stopXs = [0, 0.5, 1].map((t) => t * pathW);
  const stopYs = [0, 0.5, 1].map((t) => plateau(t) * verticalSpan);

  // Path baseline anchor (bottom of the curve at the left edge of pathW).
  // The path is centered horizontally; baseline sits ~10% above body bottom
  // so the sun at stop 0 doesn't sit directly on the body's edge.
  const baselineFromBottom = bodyH * 0.18;
  const pathLeft = (bodyW - pathW) / 2;

  // Build the SVG path for the curve (used both for the visible line and as
  // the trajectory the sun rides on).
  const samples = 64;
  const pathD = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = t * pathW;
      const yVal = plateau(t) * verticalSpan;
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${(verticalSpan - yVal).toFixed(2)}`);
    }
    return pts.join(" ");
  }, [pathW, verticalSpan]);

  // x and y motion values — animated together when the user picks a stop.
  // CSS y is +down; we want the sun to rise as the stop increases, so we
  // store the negative of the curve height.
  const x = useMotionValue<number>(stopXs[0]);
  const y = useMotionValue<number>(-stopYs[0]);

  useEffect(() => {
    x.set(stopXs[value]);
    y.set(-stopYs[value]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyW, bodyH]);

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(x, stopXs[i], { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
    animate(y, -stopYs[i], { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header — progress bar + question text on TOP */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={25} label="25% to glow" />
        <motion.h1
          className="mt-12 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
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
          className="mt-2 text-center leading-snug text-[#001050]/75"
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

      {/* Body — exponential-plateau path with a draggable sun riding it.
          The sun travels left→right and rises along the curve, with three
          discrete snap stops. Glow intensity tracks the stop. */}
      <div ref={bodyRef} className="relative min-h-0 flex-1">
        {/* SVG curve — the visible track */}
        <svg
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: pathLeft,
            bottom: baselineFromBottom,
            width: pathW,
            height: verticalSpan,
            overflow: "visible",
          }}
          viewBox={`0 0 ${pathW} ${verticalSpan}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sun-track-gradient" x1="0" y1="0" x2={pathW} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255,210,150,0.55)" />
              <stop offset="60%" stopColor="rgba(255,180,90,0.85)" />
              <stop offset="100%" stopColor="rgba(255,140,40,1)" />
            </linearGradient>
          </defs>
          {/* Track shadow / base */}
          <path
            d={pathD}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={18}
            fill="none"
            strokeLinecap="round"
          />
          {/* Track fill up to the sun */}
          <path
            d={pathD}
            stroke="url(#sun-track-gradient)"
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={1}
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1 - value / 2,
              transition: "stroke-dashoffset 600ms cubic-bezier(0.32,0.72,0,1)",
            }}
          />
        </svg>

        {/* Stop markers — small dots so the user sees where the snap points are */}
        {([0, 1, 2] as const).map((i) => (
          <div
            key={`stop-${i}`}
            className="absolute z-30 rounded-full"
            style={{
              left: pathLeft + stopXs[i],
              bottom: baselineFromBottom + stopYs[i],
              width: 14,
              height: 14,
              transform: "translate(-50%, 50%)",
              background:
                value >= i
                  ? "linear-gradient(180deg, #FFE08A 0%, #FF9A40 100%)"
                  : "rgba(255,255,255,0.95)",
              boxShadow: "0 0 0 2px rgba(0,16,80,0.08), 0 4px 10px rgba(120,160,220,0.18)",
              transition: "background 300ms ease",
            }}
          />
        ))}

        {/* Sun — glows brighter as the user climbs the curve. The motion
            x/y move the sun's center along the curve; margins offset by
            half the sun size so its center sits exactly on (x, y). */}
        <motion.button
          type="button"
          className="absolute z-40 rounded-full"
          onClick={() => {
            const next = ((value + 1) % 3) as StopIndex;
            goToStop(next);
          }}
          aria-label="Cycle sun position"
          style={{
            left: pathLeft,
            bottom: baselineFromBottom,
            x,
            y,
            width: sunPx,
            height: sunPx,
            marginLeft: -sunPx / 2,
            marginBottom: -sunPx / 2,
            cursor: "pointer",
            boxShadow: SUN_GLOWS[value],
            transition: "box-shadow 700ms cubic-bezier(0.32,0.72,0,1)",
            background: "transparent",
            border: "none",
            padding: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/icon-sun.png"
            alt="Sun"
            draggable={false}
            className="select-none"
            style={{ width: "100%", height: "auto" }}
          />
        </motion.button>

        {/* Tap zones — invisible buttons over each stop so the user can
            jump directly to a position by clicking the dot or its area. */}
        {([0, 1, 2] as const).map((i) => (
          <button
            key={`tap-${i}`}
            type="button"
            onClick={() => goToStop(i)}
            aria-label={`Sun stop ${i + 1}`}
            className="absolute z-20"
            style={{
              left: pathLeft + stopXs[i],
              bottom: baselineFromBottom + stopYs[i],
              width: 64,
              height: 64,
              transform: "translate(-50%, 50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Hint text below the bar */}
      <motion.p
        className="relative z-30 shrink-0 text-center font-bold tracking-tight text-[#001050]/60 px-7"
        style={{
          fontSize: "clamp(1rem, min(5vw, 3vh), 1.5rem)",
          marginTop: "clamp(1.25rem, 3.5vh, 2.5rem)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Tap the sun to climb the curve
      </motion.p>

      {/* Footer — glassy Back + Next text buttons */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-6 pt-2">
        {onBack ? (
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
        ) : (
          <div />
        )}
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

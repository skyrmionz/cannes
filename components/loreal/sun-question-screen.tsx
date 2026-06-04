"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";
import { useEffect, useMemo, useRef } from "react";

type StopIndex = 0 | 1 | 2;

interface Props {
  onNext: () => void;
  onBack?: () => void;
  value: StopIndex;
  onChange: (next: StopIndex) => void;
}

// Exponential-plateau curve: y(t) = 1 - exp(-k*t), normalized to [0,1].
// Larger k → faster initial rise, longer plateau toward the end.
const PLATEAU_K = 3.4;
function plateau(t: number): number {
  const norm = 1 - Math.exp(-PLATEAU_K);
  return (1 - Math.exp(-PLATEAU_K * t)) / norm;
}
// Inverse: given a target normalized height h ∈ [0,1], return the t along
// the curve where plateau(t) === h. Used to place snap stops by their
// vertical position (so stop 1 sits at exact vertical midpoint).
function inversePlateau(h: number): number {
  const norm = 1 - Math.exp(-PLATEAU_K);
  const v = 1 - h * norm;
  return -Math.log(v) / PLATEAU_K;
}

export function LorealSunQuestionScreen({ onNext, onBack, value, onChange }: Props) {
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w;
  const bodyH = bodySize.h;

  // Sun size at the *top* of the curve (largest). At progress 0 the sun is
  // SUN_MIN_SCALE × this; it grows continuously to full size at progress 1.
  const sunPxMax = useMemo(
    () => Math.max(140, Math.min(bodyH * 0.4, 340)),
    [bodyH],
  );
  const SUN_MIN_SCALE = 0.7;

  // Side padding = half the *largest* sun + buffer so the sun (at full size,
  // i.e. at the right end) never goes off-screen.
  const sidePad = sunPxMax / 2 + 18;
  const pathW = Math.max(120, bodyW - sidePad * 2);
  // Taller curve so it covers more of the screen vertically.
  const verticalSpan = Math.max(160, bodyH * 0.62);

  // Baseline anchor — half the *smallest* sun + buffer so stop 0 has
  // bottom headroom without wasting space.
  const baselineFromBottom = (sunPxMax * SUN_MIN_SCALE) / 2 + 12;
  const pathLeft = (bodyW - pathW) / 2;

  // SVG path for the curve.
  const samples = 64;
  const pathD = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const px = t * pathW;
      const yVal = plateau(t) * verticalSpan;
      pts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${(verticalSpan - yVal).toFixed(2)}`);
    }
    return pts.join(" ");
  }, [pathW, verticalSpan]);

  // x is the source of truth — drag controls x; y is derived from x via the
  // plateau function so the sun always sits on the curve.
  const x = useMotionValue<number>(0);
  const y = useTransform(x, (xv) => {
    const t = pathW > 0 ? Math.max(0, Math.min(1, xv / pathW)) : 0;
    return -plateau(t) * verticalSpan;
  });

  // Continuous progress value (0..1) used to drive glow intensity smoothly
  // as the user drags, even between stops.
  const progress = useTransform(x, (xv) => {
    const t = pathW > 0 ? Math.max(0, Math.min(1, xv / pathW)) : 0;
    return plateau(t);
  });

  // Drop-shadow stack on the sun image — follows the sun's actual shape
  // (no rectangular halo). At p=1 the layers are very wide and bright so
  // the sun reads as VERY luminous at the top of the curve.
  const sunFilter = useTransform(progress, (p) => {
    // Ease the glow growth with a soft power so the brightness ramps hard
    // toward the end (sun at level 3 is meant to feel intense).
    const g = Math.pow(p, 0.7);
    const r1 = (10 + g * 30).toFixed(1);
    const r2 = (24 + g * 110).toFixed(1);
    const r3 = (40 + g * 240).toFixed(1);
    const r4 = (60 + g * 420).toFixed(1);
    const a1 = (0.55 + g * 0.45).toFixed(2);
    const a2 = (0.3 + g * 0.7).toFixed(2);
    const a3 = (0.12 + g * 0.7).toFixed(2);
    const a4 = (0.05 + g * 0.5).toFixed(2);
    return [
      `drop-shadow(0 0 ${r1}px rgba(255,240,180,${a1}))`,
      `drop-shadow(0 0 ${r2}px rgba(255,210,110,${a2}))`,
      `drop-shadow(0 0 ${r3}px rgba(255,170,60,${a3}))`,
      `drop-shadow(0 0 ${r4}px rgba(255,140,30,${a4}))`,
    ].join(" ");
  });

  // Brightness / saturation lift on the sun pixels — strong by p=1 so the
  // sun looks like it's actually emitting light, not just reflecting it.
  const sunImgFilter = useTransform(progress, (p) => {
    const b = (1 + p * 0.45).toFixed(2);
    const s = (1 + p * 0.6).toFixed(2);
    return `brightness(${b}) saturate(${s})`;
  });

  // Sun size scales with progress: small at level 0, full at level 3.
  const sunScale = useTransform(progress, (p) => SUN_MIN_SCALE + (1 - SUN_MIN_SCALE) * p);

  // Track fill (0..1) — same as `progress`, applied to strokeDashoffset.
  const trackFill = useTransform(progress, (p) => 1 - p);

  // Snap targets — placed by their target vertical heights (0%, 50%, 100% of
  // verticalSpan) so the middle stop sits exactly at the curve's midpoint
  // and the top stop is at the plateau peak.
  const stopTs = useMemo(() => [0, inversePlateau(0.5), 1], []);
  const stopXs = useMemo(() => stopTs.map((t) => t * pathW), [stopTs, pathW]);

  // Initialise / reset x when geometry changes or the controlled value updates
  // from outside (e.g. coming back from another screen).
  const lastBodyW = useRef(0);
  useEffect(() => {
    if (bodyW !== lastBodyW.current) {
      x.set(stopXs[value]);
      lastBodyW.current = bodyW;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyW, bodyH]);

  // External value change → animate to new stop.
  useEffect(() => {
    const target = stopXs[value];
    if (Math.abs(x.get() - target) > 1) {
      animate(x, target, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathW]);

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(x, stopXs[i], { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
  };

  const handleDragEnd = () => {
    const cur = x.get();
    let closest: StopIndex = 0;
    let best = Infinity;
    for (let i = 0; i < stopXs.length; i++) {
      const d = Math.abs(stopXs[i] - cur);
      if (d < best) {
        best = d;
        closest = i as StopIndex;
      }
    }
    goToStop(closest);
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

      {/* Body — exponential-plateau curve with a draggable sun riding it. */}
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
          <path
            d={pathD}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={18}
            fill="none"
            strokeLinecap="round"
          />
          <motion.path
            d={pathD}
            stroke="url(#sun-track-gradient)"
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{ strokeDashoffset: trackFill }}
          />
        </svg>

        {/* Stop markers — show the three snap points */}
        {([0, 1, 2] as const).map((i) => {
          const t = stopTs[i];
          return (
            <div
              key={`stop-${i}`}
              className="absolute z-30 rounded-full"
              style={{
                left: pathLeft + t * pathW,
                bottom: baselineFromBottom + plateau(t) * verticalSpan,
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
          );
        })}

        {/* Tap zones for the three stops */}
        {([0, 1, 2] as const).map((i) => {
          const t = stopTs[i];
          return (
            <button
              key={`tap-${i}`}
              type="button"
              onClick={() => goToStop(i)}
              aria-label={`Sun stop ${i + 1}`}
              className="absolute z-20"
              style={{
                left: pathLeft + t * pathW,
                bottom: baselineFromBottom + plateau(t) * verticalSpan,
                width: 64,
                height: 64,
                transform: "translate(-50%, 50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            />
          );
        })}

        {/* Sun — draggable along x; y is derived from the plateau so the sun
            always rides the curve. Glow is rendered as a CSS filter on the
            image (drop-shadow stack), so it follows the sun's actual shape
            instead of a rectangular halo. A subtle pulse animation keeps it
            feeling alive at higher levels. */}
        <motion.div
          className="absolute z-40"
          drag="x"
          dragConstraints={{ left: 0, right: pathW }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            left: pathLeft,
            bottom: baselineFromBottom,
            x,
            y,
            width: sunPxMax,
            height: sunPxMax,
            marginLeft: -sunPxMax / 2,
            marginBottom: -sunPxMax / 2,
            scale: sunScale,
            cursor: "grab",
            filter: sunFilter,
            willChange: "transform, filter",
          }}
          whileTap={{ cursor: "grabbing" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/loreal/icon-sun.png"
            alt="Sun"
            draggable={false}
            className="select-none"
            style={{
              width: "100%",
              height: "auto",
              filter: sunImgFilter,
              pointerEvents: "none",
            }}
          />
        </motion.div>
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
        Drag the sun along the curve
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

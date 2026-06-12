"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  FOOTER_BUTTON_STYLE,
  HINT_TEXT_CLASS,
  HINT_TEXT_FONT_SIZE,
  SUBTITLE_FONT_SIZE,
  TITLE_MARGIN_TOP,
} from "./question-shell";

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

  // Side padding = half the *largest* sun + buffer so the sun (at full
  // size, i.e. at the right end) never goes off-screen. On narrow
  // viewports cap sidePad so the curve doesn't collapse to nothing.
  const sidePad = Math.min(sunPxMax / 2 + 18, bodyW * 0.22);
  const pathW = Math.max(160, bodyW - sidePad * 2);
  // Top padding from the body's top edge — leaves just enough room for the
  // largest sun (at the plateau peak) to render fully without crossing the
  // subtitle above. Half-sun + tiny buffer.
  const topPad = sunPxMax / 2 + 8;
  // Vertical span = remaining height after top padding and the smallest-sun
  // bottom buffer, so the curve fills the body region without leaving slack.
  const baselineFromBottom = (sunPxMax * SUN_MIN_SCALE) / 2 + 12;
  const verticalSpan = Math.max(160, bodyH - topPad - baselineFromBottom);

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

  // x = drag-controlled position in pathW pixels. We rescale it when
  // pathW changes so the sun stays at the correct fractional position
  // across remounts / resizes.
  const x = useMotionValue<number>(0);
  const y = useTransform(x, (xv) => {
    const t = pathW > 0 ? Math.max(0, Math.min(1, xv / pathW)) : 0;
    return -plateau(t) * verticalSpan;
  });
  const progress = useTransform(x, (xv) => {
    const t = pathW > 0 ? Math.max(0, Math.min(1, xv / pathW)) : 0;
    return plateau(t);
  });

  // Drop-shadow stack on the sun image — follows the sun's actual shape
  // (no rectangular halo). At p=1 the layers are very wide and bright so
  // the sun reads as VERY luminous at the top of the curve.
  const sunFilter = useTransform(progress, (p) => {
    // Power > 1 keeps the brightest glow concentrated near the top of
    // the curve. At p≈0.58 (middle stop) g≈0.41 instead of 0.68, so the
    // middle reads as a calm warm sun rather than already-blazing.
    const g = Math.pow(p, 1.6);
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

  // Snap targets — placed by their target vertical heights so the middle
  // stop sits visually centered on the curve (0.58 of verticalSpan reads
  // as the optical midpoint given the plateau's slow-down at the top) and
  // the top stop is at the plateau peak.
  const stopTs = useMemo(() => [0, inversePlateau(0.58), 1], []);
  const stopXs = useMemo(() => stopTs.map((t) => t * pathW), [stopTs, pathW]);

  // Whenever pathW changes (mount, resize, remount), preserve the sun's
  // *fractional* position. Use useLayoutEffect so the rescale happens
  // before paint and we never see a one-frame flash with the sun at the
  // wrong absolute pixel.
  const prevPathW = useRef(0);
  useLayoutEffect(() => {
    if (pathW <= 0) return;
    const cur = x.get();
    const prev = prevPathW.current;
    if (prev <= 0) {
      // First mount with a real measurement — snap to the controlled value.
      x.set(stopXs[value]);
    } else if (Math.abs(prev - pathW) > 0.5) {
      // Geometry changed — keep the same fractional position.
      const t = Math.max(0, Math.min(1, cur / prev));
      x.set(t * pathW);
    }
    prevPathW.current = pathW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathW]);

  // External value change → animate to new stop. Skipped while pathW
  // hasn't been measured yet (would set x to a stale 0).
  useEffect(() => {
    if (pathW <= 0) return;
    const target = stopXs[value];
    if (Math.abs(x.get() - target) > 1) {
      animate(x, target, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(x, stopXs[i], { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
  };

  const snapToClosestStop = () => {
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

  // Pointer-driven drag: only starts when the user grabs the sun
  // (i.e. pointerdown lands within GRAB_RADIUS of the sun's current
  // position on the curve). Clicks far from the sun do nothing — the
  // sun does NOT teleport to arbitrary curve clicks. While dragging,
  // we preserve the initial grab offset so the sun moves WITH the
  // finger instead of jumping under it.
  const GRAB_RADIUS = 80; // px tolerance for grabbing the sun
  const dragging = useRef(false);
  const grabOffsetX = useRef(0); // initial (sun_x - finger_x) at grab

  const projectToPathX = (clientX: number, target: HTMLElement) => {
    const bodyEl = target.closest("[data-sun-body]") as HTMLElement | null;
    if (!bodyEl || pathW <= 0) return null;
    const rect = bodyEl.getBoundingClientRect();
    const localX = clientX - rect.left - pathLeft;
    return localX;
  };

  const onPointerDownGrip = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const fingerX = projectToPathX(e.clientX, e.currentTarget as HTMLElement);
    if (fingerX == null) return;
    const sunX = x.get();
    // Only grab the sun if the click is within radius of its current
    // position. Outside that, the click is ignored (no teleport).
    if (Math.abs(fingerX - sunX) > GRAB_RADIUS) return;
    dragging.current = true;
    grabOffsetX.current = sunX - fingerX;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMoveGrip = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const fingerX = projectToPathX(e.clientX, e.currentTarget as HTMLElement);
    if (fingerX == null) return;
    // Apply the original grab offset so the sun stays in the same
    // relative spot under the finger throughout the drag.
    const target = Math.max(0, Math.min(pathW, fingerX + grabOffsetX.current));
    // Ease toward the target with a snappy critically-damped spring —
    // smooths per-frame jitter without lagging behind the finger.
    animate(x, target, { type: "spring", stiffness: 400, damping: 40, mass: 0.5 });
  };

  const onPointerUpGrip = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    snapToClosestStop();
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header — progress bar + question text on TOP. Header text uses
          the larger Coucou-screen scale so it reads with the same weight
          as the intro headline. */}
      <div className="relative z-30 shrink-0 px-7 pt-20">
        <LorealProgressBar percent={25} label="25%" />
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
          Sun worshipper or
          <br />
          shade seeker?
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
          Your threshold just became my first data point.
        </motion.p>
      </div>

      {/* Body — exponential-plateau curve with a draggable sun riding it.
          The curve is anchored to the TOP of the body so the plateau peak
          sits directly under the subtitle. The body fills the slack
          between the header and the hint+footer below.
          We don't paint the curve / stops / sun until pathW has been
          measured so the user never sees stops at a fallback width. */}
      <div ref={bodyRef} data-sun-body className="relative min-h-0 flex-1">
        {bodyW > 0 && (
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
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={28}
            fill="none"
            strokeLinecap="round"
          />
          <motion.path
            d={pathD}
            stroke="url(#sun-track-gradient)"
            strokeWidth={20}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{ strokeDashoffset: trackFill }}
          />
        </svg>
        )}

        {/* Stop markers — show the three snap points */}
        {bodyW > 0 && ([0, 1, 2] as const).map((i) => {
          const t = stopTs[i];
          return (
            <div
              key={`stop-${i}`}
              className="absolute z-30 rounded-full"
              style={{
                left: pathLeft + t * pathW,
                bottom: baselineFromBottom + plateau(t) * verticalSpan,
                width: 20,
                height: 20,
                transform: "translate(-50%, 50%)",
                background:
                  value >= i
                    ? "linear-gradient(180deg, #FFE08A 0%, #FF9A40 100%)"
                    : "rgba(255,255,255,0.95)",
                boxShadow: "0 0 0 3px rgba(255,200,100,0.5), 0 0 12px rgba(255,180,80,0.6), 0 4px 10px rgba(120,160,220,0.18)",
                transition: "background 300ms ease",
              }}
            />
          );
        })}

        {/* Curve hit-zone — a transparent strip covering the full body
            region that captures pointer events anywhere along/near the
            curve. The user's finger position (any direction) projects
            horizontally onto the curve, so a diagonal drag along the
            arc works as expected. */}
        {bodyW > 0 && (
          <div
            onPointerDown={onPointerDownGrip}
            onPointerMove={onPointerMoveGrip}
            onPointerUp={onPointerUpGrip}
            onPointerCancel={onPointerUpGrip}
            className="absolute inset-0 z-30"
            style={{
              cursor: "grab",
              // Critical for mobile: disable browser default
              // touch-as-scroll so we receive every pointermove
              // regardless of finger direction.
              touchAction: "none",
            }}
          />
        )}

        {/* Sun visual — rides the curve, position written directly
            via x/y motion values. Pointer-events disabled so the
            hit-zone above receives the gesture even when the finger
            is on top of the sun. */}
        <motion.div
          className="absolute z-40"
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
            filter: sunFilter,
            willChange: "transform",
            pointerEvents: "none",
          }}
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
        className={HINT_TEXT_CLASS}
        style={{
          fontSize: HINT_TEXT_FONT_SIZE,
          marginTop: "clamp(1.25rem, 3.5vh, 2.5rem)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Drag the sun on the curve
        <br />
        and click Next
      </motion.p>

      {/* Footer — glassy Back + Next text buttons */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-8 pt-2">
        {onBack ? (
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
        ) : (
          <div />
        )}
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

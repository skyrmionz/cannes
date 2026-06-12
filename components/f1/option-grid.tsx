"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { KnobOption } from "./knob-question-screen";
import { CIRCUIT_SHAPE, CIRCUIT_PATH_DATA } from "./circuit-shapes";

interface OptionGridProps {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  stepIndex?: number;
}

// All team logos are dark-on-transparent — invert them on the blue background
const INVERT_LOGOS = new Set([
  "red-bull", "ferrari", "mclaren", "mercedes", "aston-martin",
  "racing-bulls", "alpine", "williams", "haas", "audi", "cadillac",
]);

// Per-step card entrance variants
const cardVariants = {
  // Q1: slide from right like cars off the grid
  race: (i: number) => ({
    initial: { x: 80 + i * 12, opacity: 0, scale: 0.92 },
    animate: { x: 0, opacity: 1, scale: 1 },
    transition: { delay: i * 0.06, type: "spring" as const, stiffness: 380, damping: 26 },
  }),
  // Q2: rotate-scale in like a wheel of logos spinning to a stop
  wheel: (i: number) => ({
    initial: { scale: 0, rotate: -20 + i * 5, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: { delay: i * 0.055, type: "spring" as const, stiffness: 320, damping: 22 },
  }),
  // Q3: bounce up from below like a celebration jump
  celebrate: (i: number) => ({
    initial: { y: 70, scale: 0.78, opacity: 0 },
    animate: { y: 0, scale: 1, opacity: 1 },
    transition: { delay: i * 0.07, type: "spring" as const, stiffness: 440, damping: 18 },
  }),
  // default fallback
  default: (i: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay: i * 0.035, type: "spring" as const, stiffness: 420, damping: 28 },
  }),
} as const;

const stepVariantMap: Array<keyof typeof cardVariants> = ["race", "wheel", "celebrate"];

export function OptionGrid({ options, selectedId, onSelect, stepIndex = 0 }: OptionGridProps) {
  const isCircuitStep = stepIndex === 0 && options.every((o) => CIRCUIT_SHAPE[o.id]);
  const isCelebrationStep = stepIndex === 1;
  const isTeamStep = stepIndex === 2 && options.some((o) => o.logo);

  if (isCircuitStep) {
    return <CircuitGrid options={options} selectedId={selectedId} onSelect={onSelect} />;
  }

  if (isCelebrationStep) {
    return <CelebrationGrid options={options} selectedId={selectedId} onSelect={onSelect} />;
  }

  if (isTeamStep) {
    return <TeamGrid options={options} selectedId={selectedId} onSelect={onSelect} />;
  }

  const cols = options.length <= 6 ? 2 : 3;
  const isCompact = options.length > 6;
  const variantKey = stepVariantMap[stepIndex] ?? "default";

  return (
    <div
      className="grid w-full gap-3 px-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {options.map((opt, i) => {
        const selected = opt.id === selectedId;
        const v = cardVariants[variantKey](i);

        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            custom={i}
            initial={v.initial}
            animate={v.animate}
            transition={v.transition}
            whileTap={{ scale: 0.91 }}
            className="relative flex flex-col items-center justify-center gap-1 rounded-2xl text-center focus:outline-none overflow-hidden"
            style={{
              minHeight: isCompact ? 72 : 88,
              padding: isCompact ? "8px 6px" : "10px 8px",
              background: selected
                ? "rgba(0, 179, 255, 0.15)"
                : "rgba(0, 20, 80, 0.55)",
              border: `2px solid ${selected ? "#00B3FF" : "rgba(255,255,255,0.12)"}`,
              boxShadow: selected
                ? "0 0 16px rgba(0,179,255,0.5), inset 0 0 12px rgba(0,179,255,0.08)"
                : "none",
              backdropFilter: "blur(8px)",
              transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
            }}
          >
            <OptionThumb option={opt} size={isCompact ? 30 : 40} />

            <span
              className="font-bold uppercase leading-tight tracking-wide"
              style={{
                fontSize: isCompact ? 9 : 10,
                color: selected ? "#00B3FF" : "rgba(255,255,255,0.9)",
                letterSpacing: "0.06em",
              }}
            >
              {opt.label}
            </span>

            {!isCompact && opt.subtitle && (
              <span className="text-[8px] text-white/40 leading-none">{opt.subtitle}</span>
            )}

            <AnimatePresence>
              {selected && (
                <motion.div
                  key="ring"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ boxShadow: "inset 0 0 0 2px #00B3FF" }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selected && (
                <motion.div
                  key="check"
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ background: "#00B3FF" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="#001050" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Celebration grid — 2-col horizontal tiles with large emoji bubble ────────
// ─── Celebration track layout ─────────────────────────────────────────────────
// Horizontal line with 5 emoji bubbles sitting above it on stems, equal spacing.
// Tapping a bubble animates it and selects it; others dim.
// Emoji PNGs from /public/emojis/ mapped to celebration IDs
const CELEBRATION_EMOJIS: Record<string, string> = {
  jump:     "/emojis/Smile.png",
  nod:      "/emojis/Surprised.png",
  meltdown: "/emojis/Excited.png",
  frozen:   "/emojis/Star Eyes.png",
  tears:    "/emojis/Party.png",
};

function CelebrationGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // PNG assets include the circle ring and stem — render at ascending sizes left→right.
  // All px values are in the 1080×1920 kiosk canvas coordinate space.
  // Actual image dimensions: Smile 290×510, Surprised 358×609, Excited 425×697,
  //   Star Eyes 455×759, Party 530×809 → individual H/W aspect ratios below.
  const CONTAINER_H = 800;
  const WIDTHS   = [180, 190, 205, 210, 225]; // px, ascending left → right
  const ASPECTS  = [1.7, 1.70, 1.7, 1.7, 1.7]; // H/W per image
  const lefts    = [5, 23, 41, 59, 77]; // center x, % of container width
  // Y position of road line at each column, % from top (road ascends left→right)
  const roadBottoms = [83, 77, 72, 65, 62];
  // Top of each image = road y − image height, so bottom of image sits on road line
  const tops = WIDTHS.map((w, i) => roadBottoms[i] - ((w * ASPECTS[i]) / CONTAINER_H) * 100);

  return (
    <div className="relative w-full" style={{ height: CONTAINER_H, overflow: "visible" }}>
      {/* Road background — shifted down 30%, stretched wider */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0, transform: "translateY(30%) scaleX(1.4)", transformOrigin: "center" }}>
        <Image
          src="/Road07.png"
          alt=""
          fill
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center", mixBlendMode: "screen" }}
        />
      </div>

      {options.map((opt, i) => {
        const selected = opt.id === selectedId;
        const anySelected = selectedId !== null;
        const w = WIDTHS[i] ?? 80;
        const topPct = tops[i] ?? 50;
        const leftPct = lefts[i] ?? 50;
        const emojiSrc = CELEBRATION_EMOJIS[opt.id];

        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id === selectedId ? "" : opt.id)}
            className="absolute focus:outline-none"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: "translateX(-50%)",
              WebkitTapHighlightColor: "transparent",
              zIndex: selected ? 20 : 10 + i,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: anySelected && !selected ? 0.35 : 1,
              y: 0,
              filter: selected
                ? "drop-shadow(0 0 12px rgba(0,179,255,0.9)) drop-shadow(0 0 24px rgba(0,179,255,0.5))"
                : "none",
            }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 380, damping: 22 }}
            whileTap={{ scale: 0.88 }}
          >
            <motion.div
              animate={selected ? { scale: [1, 1.12, 0.96, 1.06, 1], rotate: [0, 8, -4, 2, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              {emojiSrc ? (
                <Image
                  src={emojiSrc}
                  alt={opt.label}
                  width={w}
                  height={Math.round(w * (ASPECTS[i] ?? 1.65))}
                  unoptimized
                  style={{ display: "block" }}
                />
              ) : (
                <span style={{ fontSize: w * 0.6, lineHeight: 1 }}>{opt.emoji}</span>
              )}
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Team grid — white circle badges on an S-curve path, Figma layout ─────────
const TEAM_COLOR_LOGOS: Record<string, string> = {
  "red-bull":     "/f1/teams/logos/red-bull-color.png",
  "ferrari":      "/f1/teams/logos/ferrari-color.svg",
  "mclaren":      "/f1/teams/logos/mclaren-color.svg",
  "mercedes":     "/f1/teams/logos/mercedes-color.png",
  "aston-martin": "/f1/teams/logos/aston-martin-color.svg",
  "racing-bulls": "/f1/teams/logos/racing-bulls-color.svg",
  "alpine":       "/f1/teams/logos/alpine-color.svg",
  "williams":     "/f1/teams/logos/williams-color.svg",
  "haas":         "/f1/teams/logos/haas-color.svg",
  "audi":         "/f1/teams/logos/audi-color.svg",
  "cadillac":     "/f1/teams/logos/cadillac-color.svg",
};

// Team badge positions [left%, top%] relative to container (viewBox 0 0 100 100).
// Math: right-turn C 88 8 88 48 70 48 → apex t=0.5 → (83.5, 28)
//        left-turn C 2  48 2  82 28 82 → apex t=0.5 → (8, 65)
const TEAM_POSITIONS: [number, number][] = [
  [24, 6],  [1, 6],  [55, 6],   // row 1 L→R
  [79, 22],                       // right apex
  [65, 42], [42, 42], [22, 42],  // row 2 R→L
  [10,  62],                       // left apex
  [28, 80], [52, 80], [78, 80],  // row 3 L→R
];

// SVG serpentine road — viewBox "0 0 100 100" so SVG x/y == CSS left%/top%.
// Straight rows connected by cubic-bezier U-turns; path passes through every badge center.
const SCURVE_D = "M -5 8 L 70 8 C 88 8 88 48 70 48 L 22 48 C 2 48 2 82 28 82 L 105 82";

function TeamGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const BUBBLE = 76;
  const anySelected = selectedId !== null;

  return (
    <div className="relative w-full px-2" style={{ height: "clamp(460px, 58vh, 780px)" }}>
      {/* Road background */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/road-screen6.png"
          alt=""
          fill
          unoptimized
          style={{ objectFit: "contain", mixBlendMode: "screen" }}
        />
      </div>

      {/* Team bubbles */}
      {options.map((opt, i) => {
        const pos = TEAM_POSITIONS[i] ?? [50, 50];
        const selected = opt.id === selectedId;
        const colorLogo = TEAM_COLOR_LOGOS[opt.id];

        return (
          // Plain div owns position + centering — no Framer Motion touching transform here
          <div
            key={opt.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${pos[0]}%`,
              top: `${pos[1]}%`,
              transform: "translate(-50%, calc(-50% - 9px))",
              zIndex: selected ? 10 : 1,
            }}
          >
            <motion.button
              onClick={() => onSelect(selected ? "" : opt.id)}
              className="relative flex flex-col items-center focus:outline-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: anySelected && !selected ? 0.82 : 1,
                opacity: anySelected && !selected ? 0.4 : 1,
              }}
              transition={{
                delay: i * 0.055,
                type: "spring",
                stiffness: 460,
                damping: 18,
              }}
              whileTap={{ scale: 0.88 }}
            >
              {/* White circle badge */}
              <motion.div
                className="flex items-center justify-center rounded-full bg-white"
                style={{
                  width: BUBBLE,
                  height: BUBBLE,
                  boxShadow: selected
                    ? "0 0 0 3px #00B3FF, 0 0 20px rgba(0,179,255,0.6), 0 4px 16px rgba(0,0,0,0.3)"
                    : "0 4px 16px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.2s",
                }}
                animate={selected ? { scale: [1, 1.18, 0.94, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {colorLogo && (
                  <div className="relative" style={{ width: BUBBLE * 0.7, height: BUBBLE * 0.7 }}>
                    <Image
                      src={colorLogo}
                      alt={opt.label}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                )}
              </motion.div>

              {/* Label below */}
              <span
                className="mt-1.5 text-center font-bold uppercase leading-tight"
                style={{
                  fontSize: 8,
                  letterSpacing: "0.07em",
                  color: selected ? "#fff" : "rgba(255,255,255,0.7)",
                  maxWidth: 72,
                  transition: "color 0.15s",
                }}
              >
                {opt.label}
              </span>

              {/* Selected checkmark */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    key="check"
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: "#00B3FF", zIndex: 5 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7.5L8 2.5" stroke="#001050" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

// Renders emoji image or emoji char for a celebration option
function EmojiThumb({ option, size }: { option: KnobOption; size: number }) {
  if (option.image) {
    return (
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <Image src={option.image} alt={option.label} fill unoptimized className="object-contain" />
      </div>
    );
  }
  if (option.emoji) {
    return <span style={{ fontSize: size * 0.88, lineHeight: 1 }} className="select-none">{option.emoji}</span>;
  }
  return <div style={{ width: size, height: size }} />;
}

// ─── Racing dot hook — orbits a path ref at given speed ───────────────────────
function useRacingDot(
  pathRef: React.RefObject<SVGPathElement | null>,
  dotRef: React.RefObject<SVGCircleElement | null>,
  active: boolean,
  speed: number,
) {
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const path = pathRef.current;
    const dot  = dotRef.current;
    if (!path || !dot) return;

    if (!active) {
      dot.style.opacity = "0";
      cancelAnimationFrame(rafRef.current);
      return;
    }

    dot.style.opacity = "1";

    function tick() {
      const len = path!.getTotalLength();
      posRef.current = (posRef.current + speed) % len;
      const pt = path!.getPointAtLength(posRef.current);
      dot!.setAttribute("cx", String(pt.x));
      dot!.setAttribute("cy", String(pt.y));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, speed, pathRef, dotRef]);
}

// ─── Single circuit card with idle dot + lights-on-tap ────────────────────────
function CircuitCard({
  opt,
  index,
  selectedId,
  onSelect,
  anySelected,
}: {
  opt: KnobOption;
  index: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  anySelected: boolean;
}) {
  const selected = opt.id === selectedId;
  const CircuitShape = CIRCUIT_SHAPE[opt.id];
  const pathData = CIRCUIT_PATH_DATA[opt.id];

  // Refs into the SVG overlay
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef  = useRef<SVGCircleElement>(null);

  // Lights state: null = off, 'red' = lighting up, 'green' = flash, 'done' = finished
  const [lightsState, setLightsState] = useState<null | number[]>(null); // array of lit indices

  // Idle dot: slow orbit when no card selected; victory dot after lights on selected card
  const [dotSpeed, setDotSpeed] = useState(0);
  const [dotActive, setDotActive] = useState(false);

  // Start idle dots after card entrance animation
  useEffect(() => {
    if (anySelected) return;
    const t = setTimeout(() => {
      setDotActive(true);
      setDotSpeed(0.5);
    }, 600 + index * 70);
    return () => clearTimeout(t);
  }, [anySelected, index]);

  // When another card becomes selected, cancel this card's lights + reset dot to idle
  useEffect(() => {
    if (anySelected && !selected) {
      cancelLightsRef.current();
      // Restart idle dot after a brief pause
      const t = setTimeout(() => {
        setDotActive(true);
        setDotSpeed(0.5);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [anySelected, selected]);

  useRacingDot(pathRef, dotRef, dotActive, dotSpeed);

  // Keep refs to all pending timeouts so we can cancel them on re-tap
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelLights = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    setLightsState(null);
    setDotActive(false);
    setDotSpeed(0.5); // back to idle
  }, []);

  // Expose cancel so CircuitGrid can call it when another card is tapped
  const cancelLightsRef = useRef(cancelLights);
  useEffect(() => { cancelLightsRef.current = cancelLights; }, [cancelLights]);

  const runLights = useCallback(() => {
    cancelLights();
    setLightsState([]);
    let i = 0;
    function next() {
      if (i < 5) {
        const idx = i;
        setLightsState(prev => [...(prev ?? []), idx]);
        i++;
        const t = setTimeout(next, 60);
        timeoutRefs.current.push(t);
      } else {
        const t1 = setTimeout(() => {
          setLightsState([5, 5, 5, 5, 5]); // green sentinel
          const t2 = setTimeout(() => {
            setLightsState(null);
            setDotSpeed(2.4);
            setDotActive(true);
            onSelect(opt.id);
          }, 90);
          timeoutRefs.current.push(t2);
        }, 220);
        timeoutRefs.current.push(t1);
      }
    }
    next();
  }, [cancelLights, onSelect, opt.id]);

  const handleTap = useCallback(() => {
    // If this card is already selected, deselect it
    if (selected) {
      cancelLights();
      setDotSpeed(0.5);
      setDotActive(true);
      onSelect("" as string); // signal deselect — parent stores null via setGrandPrix
      return;
    }
    runLights();
  }, [selected, cancelLights, runLights, onSelect]);

  // Lights rendering helpers
  const litCount = lightsState === null ? 0 : lightsState.length;
  const isGreen  = lightsState !== null && lightsState[0] === 5;

  return (
    <motion.button
      key={opt.id}
      onClick={handleTap}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 360, damping: 26 }}
      whileTap={{ scale: 0.97 }}
      className="relative w-full overflow-hidden rounded-2xl text-left focus:outline-none"
      style={{
        height: "clamp(110px, 14vh, 200px)",
        background: selected ? "rgba(0,30,90,0.92)" : "rgba(0,14,60,0.85)",
        border: `2px solid ${selected ? "#00B3FF" : "rgba(255,255,255,0.1)"}`,
        boxShadow: selected
          ? "0 0 24px rgba(0,179,255,0.45), inset 0 0 16px rgba(0,179,255,0.08)"
          : "0 2px 16px rgba(0,0,0,0.4)",
        opacity: anySelected && !selected ? 0.45 : 1,
        transition: "border-color 0.15s, box-shadow 0.2s, background 0.2s, opacity 0.3s",
      }}
    >
      {/* Circuit SVG */}
      {CircuitShape && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: selected ? 1 : 0.75 }}
        >
          <CircuitShape width={220} height={88} />
        </div>
      )}

      {/* Racing dot overlay — same viewBox as the circuit, sits on top */}
      {pathData && (
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%" height="100%"
          viewBox={pathData.viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{ padding: "11px" }}
        >
          {/* Hidden path for getPointAtLength */}
          <path
            ref={pathRef}
            d={pathData.d}
            fill="none"
            stroke="transparent"
            strokeWidth="1"
          />
          <circle
            ref={dotRef}
            r="3.5"
            fill="white"
            style={{
              opacity: 0,
              filter: "drop-shadow(0 0 3px white) drop-shadow(0 0 7px #00B3FF)",
              transition: "opacity 0.2s ease",
            }}
          />
        </svg>
      )}

      {/* Start lights strip — top right, 5 vertical dots */}
      <div
        className="absolute right-3 top-3 flex flex-col items-center gap-1"
        style={{ zIndex: 4 }}
      >
        {[0, 1, 2, 3, 4].map((li) => {
          const lit = !isGreen && lightsState !== null && li < litCount;
          const green = isGreen;
          return (
            <div
              key={li}
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: green ? "#00ff44" : lit ? "#ff2200" : "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: green
                  ? "0 0 5px #00ff44, 0 0 10px rgba(0,255,68,0.5)"
                  : lit
                    ? "0 0 5px #ff2200, 0 0 10px rgba(255,34,0,0.5)"
                    : "none",
                transition: "background 80ms ease, box-shadow 80ms ease",
              }}
            />
          );
        })}
      </div>

      {/* Bottom scrim + label */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6"
        style={{ background: "linear-gradient(to top, rgba(0,8,40,0.9) 0%, transparent 100%)" }}
      >
        <span
          className="block font-bold uppercase leading-tight text-white"
          style={{ fontSize: 11, letterSpacing: "0.08em" }}
        >
          {opt.label}
        </span>
      </div>

      {/* Checkmark badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: "#00B3FF", zIndex: 5 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7.5L8 2.5" stroke="#001050" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection ring glow */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="ring"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ boxShadow: "inset 0 0 0 2px #00B3FF" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Circuit card layout — dark landscape cards, circuit fills card, label at bottom ───
function CircuitGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const anySelected = selectedId !== null;

  return (
    <div className="flex w-full flex-col gap-3 px-4">
      {options.map((opt, i) => (
        <CircuitCard
          key={opt.id}
          opt={opt}
          index={i}
          selectedId={selectedId}
          onSelect={onSelect}
          anySelected={anySelected}
        />
      ))}
    </div>
  );
}

function OptionThumb({ option, size }: { option: KnobOption; size: number }) {
  const dim = { width: size, height: size };
  const shouldInvert = option.logo && INVERT_LOGOS.has(option.id);

  // Circuit options are rendered by CircuitGrid, not OptionThumb
  if (CIRCUIT_SHAPE[option.id]) return null;

  if (option.logo) {
    return (
      <div className="relative flex-shrink-0" style={dim}>
        <Image
          src={option.logo}
          alt={option.label}
          fill
          unoptimized
          className={`object-contain ${shouldInvert ? "brightness-0 invert" : ""}`}
        />
      </div>
    );
  }
  if (option.emoji) {
    return (
      <span style={{ fontSize: size * 0.88, lineHeight: 1 }} className="select-none">
        {option.emoji}
      </span>
    );
  }
  if (option.image) {
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-xl" style={dim}>
        <Image src={option.image} alt={option.label} fill unoptimized className="object-cover" />
      </div>
    );
  }
  return <div className="flex-shrink-0 rounded-xl bg-white/10" style={dim} />;
}

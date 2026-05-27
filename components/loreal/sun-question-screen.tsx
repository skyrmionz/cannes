"use client";

import { useState } from "react";
import { motion, type PanInfo, useMotionValue } from "motion/react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";

interface Props {
  onNext: () => void;
}

// Sun stops as `bottom` offsets in px. Stop 0 = sun mostly hidden behind hills.
// Stop 2 = sun high in the sky, just below the subtitle.
// We use a single anchor (`SUN_ANCHOR_BOTTOM`) and offset relative to it via
// `y` so drag and snap share the same coordinate system — avoids the prior
// "sun escapes the range" bug where bottom + transform fought each other.
const SUN_ANCHOR_BOTTOM = 110; // matches the lowest stop's actual rest
const STOPS = [
  { y: 0, label: "Just a peek" },        // bottom: 110
  { y: -240, label: "A healthy dose" },   // bottom: 350
  { y: -440, label: "Bake me" },          // bottom: 550 (under subtitle)
] as const;
type StopIndex = 0 | 1 | 2;

const HILL_BOTTOM_PX = 80;

const SKY_TINTS = [
  "radial-gradient(80% 60% at 50% 80%, rgba(255,210,160,0) 0%, rgba(255,210,160,0) 100%)",
  "radial-gradient(80% 60% at 50% 80%, rgba(255,180,120,0.55) 0%, rgba(255,210,140,0) 70%)",
  "radial-gradient(95% 75% at 50% 70%, rgba(255,170,80,0.7) 0%, rgba(255,210,120,0.2) 60%, rgba(255,230,150,0) 100%)",
] as const;

export function LorealSunQuestionScreen({ onNext }: Props) {
  const [stopIndex, setStopIndex] = useState<StopIndex>(0);
  // Use a motion value so drag updates and snap-to-stop both write to the
  // same value — no transform/style conflicts.
  const y = useMotionValue<number>(STOPS[0].y);

  const handleDragEnd = () => {
    const current = y.get();
    let closest: StopIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < STOPS.length; i++) {
      const d = Math.abs(STOPS[i].y - current);
      if (d < bestDist) {
        bestDist = d;
        closest = i as StopIndex;
      }
    }
    setStopIndex(closest);
  };

  // Drag bounds are absolute in motion-value space because we use `y` directly:
  // y range is [STOPS[2].y, STOPS[0].y] = [-440, 0]
  const dragBounds = {
    top: STOPS[STOPS.length - 1].y, // most negative (highest)
    bottom: STOPS[0].y, // least negative (lowest)
  };

  const goToStop = (i: StopIndex) => {
    setStopIndex(i);
    // animate the motion value to the new stop
    y.set(STOPS[i].y);
  };

  return (
    <div className="relative h-full w-full">
      {/* Sky tint */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: SKY_TINTS[stopIndex],
          transition: "background 700ms ease",
        }}
      />

      {/* Header — progress bar + title + subtitle */}
      <div className="relative z-30 px-7 pt-6">
        <LorealProgressBar percent={20} label="20% to glow" />

        <motion.h1
          className="mt-6 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.75rem, 6.5vw, 2.4rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          How much sun is fun for you?
        </motion.h1>

        <motion.p
          className="mt-2 text-center leading-snug text-[#001050]/75"
          style={{
            fontSize: "clamp(0.85rem, 3.4vw, 0.95rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          L&apos;Oréal data shows that UV exposure and stress contribute to
          tired skin.
        </motion.p>
      </div>

      {/* Notch labels — positioned on the LEFT, vertically aligned with each
          sun stop. Their bottom values stay below the subtitle so they sit
          inside the glass card next to the sun, not above the progress bar. */}
      {STOPS.map((stop, i) => (
        <NotchLabel
          key={stop.label}
          label={stop.label}
          // sun's actual visual bottom = SUN_ANCHOR_BOTTOM + |y|
          bottomPx={SUN_ANCHOR_BOTTOM + Math.abs(stop.y) + 40}
          active={i === stopIndex}
          onClick={() => goToStop(i as StopIndex)}
        />
      ))}

      {/* Sun — z-10, draggable, sits BEHIND the hill so the low stop peeks. */}
      <motion.div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        drag="y"
        dragConstraints={dragBounds}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ y: STOPS[stopIndex].y }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        style={{ bottom: SUN_ANCHOR_BOTTOM, y, cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        <Image
          src="/loreal/sun.png"
          alt="Sun"
          width={400}
          height={400}
          priority
          draggable={false}
          className="select-none"
          style={{
            width: "min(40vw, 28vh)",
            height: "auto",
            filter: "drop-shadow(0 8px 24px rgba(255,170,40,0.45))",
          }}
        />
      </motion.div>

      {/* Hill — z-20, ALWAYS painted on top so the sun hides behind it at low. */}
      <Image
        src="/loreal/hill-scene-v5.png"
        alt=""
        width={1247}
        height={350}
        priority
        className="pointer-events-none absolute z-20 h-auto select-none"
        style={{
          bottom: `${HILL_BOTTOM_PX}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(110vw, 92vh)",
        }}
      />

      {/* Next button */}
      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="absolute bottom-10 right-8 z-30 grid h-14 w-14 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)",
          boxShadow: [
            "0 1px 0 rgba(255,255,255,0.45) inset",
            "0 -1px 0 rgba(0,16,80,0.25) inset",
            "0 0 0 1px rgba(255,255,255,0.25) inset",
            "0 12px 28px rgba(15,84,200,0.4)",
          ].join(", "),
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6 text-white" strokeWidth={3} />
      </motion.button>
    </div>
  );
}

function NotchLabel({
  label,
  bottomPx,
  active,
  onClick,
}: {
  label: string;
  bottomPx: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto absolute left-7 z-30 flex items-center gap-2 transition-all duration-300"
      style={{
        bottom: `${bottomPx}px`,
        opacity: active ? 1 : 0.55,
      }}
    >
      <span
        className="block rounded-full transition-all duration-300"
        style={{
          width: active ? 14 : 10,
          height: active ? 14 : 10,
          background: active ? "#FFAA33" : "#001050",
          boxShadow: active
            ? "0 0 14px rgba(255,170,40,0.7), 0 0 0 3px rgba(255,255,255,0.6)"
            : "0 0 0 2px rgba(255,255,255,0.5)",
        }}
      />
      <span
        className="text-sm font-bold tracking-tight transition-colors duration-300"
        style={{ color: active ? "#001050" : "rgba(0,16,80,0.55)" }}
      >
        {label}
      </span>
    </button>
  );
}

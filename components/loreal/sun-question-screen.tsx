"use client";

import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";

interface Props {
  onNext: () => void;
}

// Sun stops, bottom: in px. The hill silhouette sits between bottom: 80px
// and ~360px, so stop 0 puts the sun mostly hidden behind the hill.
const STOPS = [
  { bottom: 110, label: "Just a peek" },
  { bottom: 360, label: "A healthy dose" },
  { bottom: 560, label: "Bake me" },
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

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    // info.offset.y: negative = dragged up, positive = dragged down.
    const visualBottom = STOPS[stopIndex].bottom - info.offset.y;
    let closest: StopIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < STOPS.length; i++) {
      const d = Math.abs(STOPS[i].bottom - visualBottom);
      if (d < bestDist) {
        bestDist = d;
        closest = i as StopIndex;
      }
    }
    setStopIndex(closest);
  };

  // dragConstraints are RELATIVE to the element's CURRENT animated position
  // (which uses `bottom: STOPS[stopIndex].bottom`). Framer applies offsets in
  // CSS-y terms: positive `info.offset.y` means dragged DOWN (towards stop 0,
  // which has lower bottom-px), negative means dragged UP (towards stop 2).
  const currentBottom = STOPS[stopIndex].bottom;
  // Most negative offset = drag up to stop 2 (highest)
  const dragTop = -(STOPS[2].bottom - currentBottom);
  // Most positive offset = drag down to stop 0 (lowest)
  const dragBottom = currentBottom - STOPS[0].bottom;

  return (
    <div className="relative h-full w-full">
      {/* Sky tint — sits behind everything, warms up as the sun rises */}
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

      {/* Notch labels — vertically aligned with each sun stop, on the left */}
      <div className="pointer-events-none absolute left-6 z-30 flex flex-col items-start">
        {STOPS.map((stop, i) => (
          <NotchLabel
            key={stop.label}
            label={stop.label}
            bottomPx={stop.bottom}
            active={i === stopIndex}
            onClick={() => setStopIndex(i as StopIndex)}
          />
        ))}
      </div>

      {/* Sun — z-10, draggable, sits BEHIND the hill so the low stop peeks. */}
      <motion.div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        drag="y"
        dragConstraints={{ top: dragTop, bottom: dragBottom }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        style={{ bottom: STOPS[stopIndex].bottom, cursor: "grab" }}
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
        src="/loreal/hill-scene-v3.png"
        alt=""
        width={893}
        height={419}
        priority
        className="pointer-events-none absolute z-20 h-auto select-none"
        style={{
          bottom: `${HILL_BOTTOM_PX}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(94vw, 56vh)",
        }}
      />

      {/* Next button — bottom-right of glass card */}
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
      className="pointer-events-auto absolute flex items-center gap-2 transition-all duration-300"
      style={{
        bottom: `${bottomPx + 30}px`, // align label vertically with the sun's center
        opacity: active ? 1 : 0.45,
      }}
    >
      {/* Notch dot */}
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
        style={{
          color: active ? "#001050" : "rgba(0,16,80,0.55)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

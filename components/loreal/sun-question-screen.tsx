"use client";

import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";

interface Props {
  onNext: () => void;
}

// Three sun positions inside the stage. Values are the `bottom` offset in px
// from the screen's bottom edge. Stop 0 is "barely peeking" — most of the sun
// is hidden behind the hill silhouette. Stop 2 is high above the sky.
const STOPS = [80, 320, 520] as const;
type StopIndex = 0 | 1 | 2;

// The hill is positioned with its base at this `bottom` offset so the sun's
// low stop sits behind the silhouette of the hill.
const HILL_BOTTOM_PX = 80;

// Soft warm overlay tints — sit behind the hill+sun, get more amber/orange
// as the sun rises so the "sky" feels sunnier without a hard sky card.
const SKY_TINTS = [
  // low — barely tinted (still mostly the page-blue)
  "radial-gradient(80% 60% at 50% 80%, rgba(255,210,160,0) 0%, rgba(255,210,160,0) 100%)",
  // mid — golden warmth from the horizon
  "radial-gradient(80% 60% at 50% 80%, rgba(255,180,120,0.55) 0%, rgba(255,210,140,0) 70%)",
  // high — full warm wash
  "radial-gradient(95% 75% at 50% 70%, rgba(255,170,80,0.7) 0%, rgba(255,210,120,0.2) 60%, rgba(255,230,150,0) 100%)",
] as const;

export function LorealSunQuestionScreen({ onNext }: Props) {
  const [stopIndex, setStopIndex] = useState<StopIndex>(0);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const visualBottom = STOPS[stopIndex] - info.offset.y;
    let closest: StopIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < STOPS.length; i++) {
      const d = Math.abs(STOPS[i] - visualBottom);
      if (d < bestDist) {
        bestDist = d;
        closest = i as StopIndex;
      }
    }
    setStopIndex(closest);
  };

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

      {/* Header zone — progress bar + title + subtitle */}
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

      {/* Sun — z-10, draggable, sits BEHIND the hill so the low stop appears
          to peek. Centered horizontally; vertical position drives `bottom`. */}
      <motion.div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        drag="y"
        dragConstraints={{
          top: -(STOPS[2] - STOPS[0]) - 60,
          bottom: 60,
        }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ bottom: STOPS[stopIndex], cursor: "grab" }}
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

      {/* Hill — z-20, ALWAYS painted on top so the sun hides behind it at low.
          Positioned directly on the page (no card). */}
      <Image
        src="/loreal/hill-scene.png"
        alt=""
        width={1024}
        height={1024}
        priority
        className="pointer-events-none absolute z-20 h-auto select-none"
        style={{
          bottom: `${HILL_BOTTOM_PX}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90vw, 60vh)",
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

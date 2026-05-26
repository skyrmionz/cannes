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
// from the stage's bottom edge. Stop 0 is "barely peeking" — most of the sun
// is hidden behind the hill silhouette. Stop 2 is high above the sky.
const STOPS = [-90, 170, 320] as const;
type StopIndex = 0 | 1 | 2;

const SKY_GRADIENTS = [
  // sleepy / barely peeking — cool blue → muted peach
  "linear-gradient(180deg, #BFD9FF 0%, #FFE4C4 100%)",
  // golden hour — warm amber → buttery yellow
  "linear-gradient(180deg, #FFB877 0%, #FFD89A 100%)",
  // full sunny — bright yellow → orange
  "linear-gradient(180deg, #FFE066 0%, #FFAA33 100%)",
] as const;

export function LorealSunQuestionScreen({ onNext }: Props) {
  const [stopIndex, setStopIndex] = useState<StopIndex>(0);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    // info.offset.y: negative when dragged up, positive when dragged down.
    // Compute the visual "bottom" the sun is currently at, then snap to the
    // closest stop.
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
      {/* Header zone — progress bar + title + subtitle */}
      <div className="relative z-10 px-7 pt-6">
        <LorealProgressBar percent={20} label="20% to glow" />

        <motion.h1
          className="mt-6 text-left font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.75rem, 6.5vw, 2.4rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          How much sun is fun for you?
        </motion.h1>

        <motion.p
          className="mt-2 text-left leading-snug text-[#001050]/75"
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

      {/* Stage — sky + draggable sun + hill, mounted between header and CTA. */}
      <div className="absolute inset-x-7 bottom-32 top-44">
        <SunStage stopIndex={stopIndex} onDragEnd={handleDragEnd} />
      </div>

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

function SunStage({
  stopIndex,
  onDragEnd,
}: {
  stopIndex: StopIndex;
  onDragEnd: (e: PointerEvent, info: PanInfo) => void;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-3xl"
      style={{
        background: SKY_GRADIENTS[stopIndex],
        transition: "background 700ms ease",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      {/* Sun — z-10, BELOW the hill so it appears to sit behind it at the low stop */}
      <motion.div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        drag="y"
        dragConstraints={{
          top: -(STOPS[2] - STOPS[0]) - 40, // slightly past stop 2
          bottom: 40, // slightly past stop 0
        }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={onDragEnd}
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
          className="h-[160px] w-[160px] select-none"
          style={{
            filter: "drop-shadow(0 8px 24px rgba(255,170,40,0.45))",
          }}
        />
      </motion.div>

      {/* Hill — z-20, ALWAYS painted on top so the sun hides behind it at low */}
      <Image
        src="/loreal/hill-scene.png"
        alt=""
        width={1024}
        height={1820}
        priority
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-auto w-full select-none"
        style={{ transform: "translateY(8%)" }}
      />
    </div>
  );
}

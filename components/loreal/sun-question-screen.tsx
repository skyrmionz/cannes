"use client";

import { motion, useMotionValue, animate } from "motion/react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";

interface Props {
  onNext: () => void;
  value: StopIndex;
  onChange: (next: StopIndex) => void;
}

// Sun stops as `bottom` offsets in px. Stop 0 = sun mostly hidden behind hills.
// Stop 2 = sun high in the sky, just below the subtitle.
// We use a single anchor (`SUN_ANCHOR_BOTTOM`) and offset relative to it via
// `y` so drag and snap share the same coordinate system.
const SUN_ANCHOR_BOTTOM = 110;
const STOPS = [
  { y: 0, label: "Just a Peek" },
  { y: -240, label: "A Healthy Dose" },
  { y: -440, label: "Bake Me" },
] as const;
type StopIndex = 0 | 1 | 2;

const HILL_BOTTOM_PX = 80;

export function LorealSunQuestionScreen({ onNext, value, onChange }: Props) {
  const stopIndex = value;
  const y = useMotionValue<number>(STOPS[value].y);

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
    // Always animate to the snapped position — even if the user dropped the
    // sun mid-way between two stops or didn't change the closest stop.
    animate(y, STOPS[closest].y, {
      type: "spring",
      stiffness: 420,
      damping: 32,
    });
    onChange(closest);
  };

  const dragBounds = {
    top: STOPS[STOPS.length - 1].y,
    bottom: STOPS[0].y,
  };

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(y, STOPS[i].y, {
      type: "spring",
      stiffness: 420,
      damping: 32,
    });
  };

  return (
    // Outer wrapper: matches the persistent shell's glass card inset (inset-3)
    // and rounded radius so anything painted inside is CLIPPED to the card.
    // Sky tint lives at the page level (app/loreal/page.tsx) so warmth
    // bleeds across the whole page background, not just inside the card.
    <div className="absolute inset-3 overflow-hidden rounded-[40px]">
      {/* Header — progress bar + title + subtitle.
          Extra top padding so the title has breathing room from the bar. */}
      <div className="relative z-30 px-7 pt-7">
        <LorealProgressBar percent={20} label="20% to glow" />

        <motion.h1
          className="mt-12 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
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

      {/* Notch labels — anchored to the RIGHT side of the card, in their own
          band above the hill silhouette. Bigger text, no dots. */}
      <NotchLabel
        label="Bake Me"
        bottomPx={580}
        active={stopIndex === 2}
        onClick={() => goToStop(2)}
      />
      <NotchLabel
        label="A Healthy Dose"
        bottomPx={510}
        active={stopIndex === 1}
        onClick={() => goToStop(1)}
      />
      <NotchLabel
        label="Just a Peek"
        bottomPx={440}
        active={stopIndex === 0}
        onClick={() => goToStop(0)}
      />

      {/* Sun — z-40 so it sits in front of notch labels (z-30) but BEHIND the
          hill (z-50, bumped). */}
      <motion.div
        className="absolute left-1/2 z-40 -translate-x-1/2"
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
            width: "min(50vw, 36vh)",
            height: "auto",
            filter: "drop-shadow(0 8px 24px rgba(255,170,40,0.45))",
          }}
        />
      </motion.div>

      {/* Hill — z-50, painted on top of the sun so it hides behind at low.
          Width capped at 100% of the card so it never bleeds past edges. */}
      <Image
        src="/loreal/hill-scene-v5.png"
        alt=""
        width={1247}
        height={350}
        priority
        className="pointer-events-none absolute z-50 h-auto select-none"
        style={{
          bottom: `${HILL_BOTTOM_PX}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(100%, 92vh)",
        }}
      />

      {/* Next button */}
      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="absolute bottom-8 right-6 z-30 grid h-14 w-14 place-items-center rounded-full"
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
      className="pointer-events-auto absolute right-7 z-30 transition-all duration-300"
      style={{
        bottom: `${bottomPx}px`,
        opacity: active ? 1 : 0.55,
        fontSize: "clamp(1.125rem, 4.4vw, 1.5rem)",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: active ? "#001050" : "rgba(0,16,80,0.55)",
      }}
    >
      {label}
    </button>
  );
}

"use client";

import { motion, useMotionValue, animate } from "motion/react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";
import { useEffect } from "react";

type StopIndex = 0 | 1 | 2;

interface Props {
  onNext: () => void;
  value: StopIndex;
  onChange: (next: StopIndex) => void;
}

// Sun position math is derived from the body's measured height (via
// ResizeObserver) so the scene works at every resolution — 1920x1080
// down through phone portrait. The sun travels between three stops
// computed as fractions of the body height; all hard-coded pixel
// offsets have been removed.
const STOP_FRACS: readonly [number, number, number] = [0, 0.32, 0.62];
// bottomPx fraction per stop. "Just a Peek" sits low, "Bake Me" high.
const NOTCH_FRACS: readonly [number, number, number] = [0.36, 0.6, 0.84];
const STOP_LABELS: readonly [string, string, string] = [
  "Just a Peek",
  "A Healthy Dose",
  "Bake Me",
];

export function LorealSunQuestionScreen({ onNext, value, onChange }: Props) {
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyH = bodySize.h;

  // Stops are negative offsets (sun moves up) measured from the sun's
  // anchored position at the bottom of the body region. Stop 0 = anchor,
  // stop 2 = highest. All distances scale with body height.
  const stops = [
    0,
    -bodyH * STOP_FRACS[1],
    -bodyH * STOP_FRACS[2],
  ] as const;
  const sunAnchorBottom = Math.max(24, bodyH * 0.06);
  const hillBottomPx = Math.max(0, bodyH * 0.02);

  const stopIndex = value;
  const y = useMotionValue<number>(0);

  // Snap (no animation) on geometry shifts only — first measurement and
  // viewport resize. This must NOT depend on stopIndex, otherwise it would
  // fight the imperative tweens started by drag-end / notch tap.
  useEffect(() => {
    y.set(stops[stopIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyH]);

  const handleDragEnd = () => {
    const current = y.get();
    let closest: StopIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < stops.length; i++) {
      const d = Math.abs(stops[i] - current);
      if (d < bestDist) {
        bestDist = d;
        closest = i as StopIndex;
      }
    }
    animate(y, stops[closest], {
      duration: 0.55,
      ease: [0.32, 0.72, 0, 1],
    });
    onChange(closest);
  };

  const dragBounds = {
    top: stops[stops.length - 1],
    bottom: stops[0],
  };

  const goToStop = (i: StopIndex) => {
    onChange(i);
    animate(y, stops[i], {
      duration: 0.55,
      ease: [0.32, 0.72, 0, 1],
    });
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header — shrink-0 so it never compresses. */}
      <div className="relative z-30 shrink-0 px-7 pt-7">
        <LorealProgressBar percent={20} label="20% to glow" />
        <motion.h1
          className="mt-6 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.25rem, min(6vw, 4.2vh), 2.4rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          How much sun is fun for you?
        </motion.h1>
        <motion.p
          className="mt-2 text-center leading-snug text-[#001050]/75"
          style={{
            fontSize: "clamp(0.75rem, min(3.2vw, 2vh), 0.95rem)",
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

      {/* Body — flex-1 min-h-0 contains the sun + hill + notch labels. All
          positions inside scale with the measured body height. */}
      <div ref={bodyRef} className="relative min-h-0 flex-1">
        {([0, 1, 2] as StopIndex[]).map((i) => (
          <NotchLabel
            key={i}
            label={STOP_LABELS[i]}
            bottomPx={bodyH * NOTCH_FRACS[i]}
            active={stopIndex === i}
            onClick={() => goToStop(i)}
          />
        ))}

        {/* Sun. Image size scales with body height so it never overflows. */}
        <motion.div
          className="absolute left-1/2 z-40 -translate-x-1/2"
          drag="y"
          dragConstraints={dragBounds}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ bottom: sunAnchorBottom, y, cursor: "grab" }}
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
              width: `${Math.max(120, Math.min(bodyH * 0.42, 360))}px`,
              height: "auto",
              filter: "drop-shadow(0 8px 24px rgba(255,170,40,0.45))",
            }}
          />
        </motion.div>

        {/* Hill — clamped to body width, painted over the sun at low stops. */}
        <Image
          src="/loreal/hill-scene-v5.png"
          alt=""
          width={1247}
          height={350}
          priority
          className="pointer-events-none absolute z-50 h-auto select-none"
          style={{
            bottom: `${hillBottomPx}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        />
      </div>

      {/* Footer — shrink-0 row holding the next button. Always inside card. */}
      <div className="relative z-30 flex shrink-0 items-center justify-end px-6 pb-6 pt-2">
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="grid h-14 w-14 place-items-center rounded-full"
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
        fontSize: "clamp(0.95rem, min(4.2vw, 2.8vh), 1.5rem)",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: active ? "#001050" : "rgba(0,16,80,0.55)",
      }}
    >
      {label}
    </button>
  );
}

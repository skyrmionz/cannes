"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";

export type AgendaIndex = 0 | 1 | 2 | 3;

interface Props {
  onNext: () => void;
  onBack: () => void;
  value: AgendaIndex | null;
  onChange: (next: AgendaIndex) => void;
}

const TITLES: ReadonlyArray<string> = [
  "Packed",
  "Curated",
  "Spontaneous",
  "Salesforce Forever",
];

const DESCRIPTIONS: ReadonlyArray<string> = [
  "Panels, meetings, parties, repeat.",
  "I know exactly which parties are worth my time.",
  "I'll see what kind of trouble I can find.",
  "Please don't make me leave this beach.",
];

const SWIPE_THRESHOLD = 40;

const DAY_START = 9;
const DAY_END = 19;
const HOURS = DAY_END - DAY_START; // 10

type Slot = { start: number; end: number; title: string; hue: number };

const SCHEDULES: Record<AgendaIndex, ReadonlyArray<Slot>> = {
  0: Array.from({ length: HOURS }, (_, idx) => {
    const h = DAY_START + idx;
    return {
      start: h,
      end: h + 1,
      title: "Event " + (h - 8),
      hue: ((h - 9) * 36) % 360,
    };
  }),
  1: [
    { start: 9, end: 10, title: "Morning panel", hue: 200 },
    { start: 11, end: 12, title: "Coffee chat", hue: 30 },
    { start: 13, end: 14, title: "Lunch", hue: 60 },
    { start: 16, end: 17, title: "Demo", hue: 280 },
    { start: 18, end: 19, title: "Sunset rosé", hue: 340 },
  ],
  2: [{ start: 9, end: 19, title: "OOO 😎", hue: 42 }],
  3: [{ start: 9, end: 19, title: "Salesforce ☁️", hue: 215 }],
};

const GLASS_BUTTON: React.CSSProperties = {
  background: "rgba(255,255,255,0.45)",
  boxShadow: [
    "0 0 0 1px rgba(255,255,255,0.6) inset",
    "0 1px 0 rgba(255,255,255,0.8) inset",
    "0 8px 24px rgba(120,160,220,0.2)",
  ].join(", "),
  WebkitBackdropFilter: "blur(12px) saturate(140%)",
  backdropFilter: "blur(12px) saturate(140%)",
};

export function LorealAgendaQuestionScreen({
  onNext,
  onBack,
  value,
  onChange,
}: Props) {
  const handleNext = () => {
    if (value === null) return;
    onNext();
  };

  const displayIndex: AgendaIndex = value ?? 0;
  const [touched, setTouched] = useState<boolean>(value !== null);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Measure the body region so the day-view calendar can fill the slack.
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w || 360;

  const isPhone = bodyW < 420;
  const arrowSize = isPhone ? 36 : 48;
  const arrowIcon = isPhone ? 16 : 18;

  // Carousel title row height: floor min(72px, ~10vh).
  const titleRowMinH = 72;
  // Description row floor.
  const descRowMinH = isPhone ? 32 : 48;

  const goNext = () => {
    setDirection(1);
    setTouched(true);
    const next = (((displayIndex + 1) % 4) as AgendaIndex);
    onChange(next);
  };

  const goPrev = () => {
    setDirection(-1);
    setTouched(true);
    const prev = (((displayIndex + 3) % 4) as AgendaIndex);
    onChange(prev);
  };

  // Pointer-event swipe on the title + carousel area.
  const startXRef = useRef<number | null>(null);
  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture can throw in older webkit; safe to ignore.
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const start = startXRef.current;
    startXRef.current = null;
    if (start === null) return;
    const dx = e.clientX - start;
    if (dx < -SWIPE_THRESHOLD) goNext();
    else if (dx > SWIPE_THRESHOLD) goPrev();
  };

  // Keep linter happy if `touched` ever becomes meaningful for visuals later.
  void touched;

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header — matches sun/hydration question format */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={75} label="75%" />
        <motion.h1
          className="mt-12 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "min(7vw, 4.4vh)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          What&apos;s your Cannes
          <br />
          agenda like?
        </motion.h1>
        <motion.p
          className="mt-3 text-center leading-snug text-[#001050]/85"
          style={{
            fontSize: "min(3.6vw, 1.7vh)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          This is what ties it all together.
        </motion.p>
      </div>

      {/* Body — carousel title + description + day-view calendar. */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col"
        style={{
          paddingInline: "16px",
          paddingBlock: "clamp(0.5rem, 1.5vh, 1rem)",
          gap: "clamp(0.5rem, 1.2vh, 0.85rem)",
        }}
      >
        {/* Carousel title row + swipe gesture wrapper */}
        <div
          className="relative shrink-0"
          style={{
            height: `min(${titleRowMinH}px, 10vh)`,
            minHeight: titleRowMinH,
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            startXRef.current = null;
          }}
        >
          {/* Sliding title */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={displayIndex}
                className="font-bold tracking-tight text-[#001050]"
                style={{
                  fontSize: "clamp(1.5rem, min(7vw, 4.4vh), 2.2rem)",
                  whiteSpace: "nowrap",
                }}
                initial={{ x: 60 * direction, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60 * direction, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                {TITLES[displayIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Left arrow — half-overlapping the body's left edge. */}
          <motion.button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#001050]"
            style={{
              ...GLASS_BUTTON,
              left: -16,
              width: arrowSize,
              height: arrowSize,
            }}
          >
            <ChevronLeft size={arrowIcon} strokeWidth={2.5} />
          </motion.button>

          {/* Right arrow — half-overlapping the body's right edge. */}
          <motion.button
            type="button"
            onClick={goNext}
            aria-label="Next"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#001050]"
            style={{
              ...GLASS_BUTTON,
              right: -16,
              width: arrowSize,
              height: arrowSize,
            }}
          >
            <ChevronRight size={arrowIcon} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Description row */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ minHeight: descRowMinH }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={displayIndex}
              className="absolute inset-0 flex items-center justify-center text-center text-[#001050]/85"
              style={{
                fontSize: "clamp(1rem, min(4vw, 2.4vh), 1.4rem)",
                fontFamily:
                  'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 400,
                paddingInline: 8,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {DESCRIPTIONS[displayIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Day-view calendar — fills remaining slack */}
        <div className="relative min-h-0 flex-1">
          <CalendarColumn index={displayIndex} />
        </div>
      </div>

      {/* Footer — glassy Back + Next text buttons (matching other questions) */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-6 pt-2">
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
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={value === null}
          whileHover={value !== null ? { scale: 1.04 } : undefined}
          whileTap={value !== null ? { scale: 0.96 } : undefined}
          className="rounded-full font-semibold text-[#001050] tracking-tight disabled:cursor-not-allowed"
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
            opacity: value !== null ? 1 : 0.4,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: value !== null ? 1 : 0.4, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}

function CalendarColumn({ index }: { index: AgendaIndex }) {
  // Measure the calendar wrapper to derive pxPerHour. useElementSize is the
  // shared hook used elsewhere in the file.
  const { ref, size } = useElementSize<HTMLDivElement>();
  const measuredH = size.h || 0;
  const pxPerHour = Math.max(1, Math.floor(measuredH / HOURS));

  const slots = SCHEDULES[index];
  const hideTitle = pxPerHour < 22;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <AnimatePresence initial={false}>
        {slots.map((slot, i) => {
          const top = (slot.start - DAY_START) * pxPerHour;
          const heightPx = (slot.end - slot.start) * pxPerHour - 4;
          const blockSpan = slot.end - slot.start;
          const isTall = heightPx > 80;
          const titleSize = isTall ? 18 : 14;
          const timeLabel = `${String(slot.start).padStart(2, "0")}:00`;
          return (
            <motion.div
              key={`${index}-${slot.start}-${slot.end}`}
              className="absolute"
              style={{
                top,
                left: 0,
                right: 0,
                height: Math.max(0, heightPx),
                background: `hsla(${slot.hue}, 75%, 62%, 0.72)`,
                borderRadius: 24,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.5) inset, 0 1px 0 rgba(255,255,255,0.85) inset, 0 8px 22px hsla(${slot.hue},65%,55%,0.32)`,
                backdropFilter: "blur(8px) saturate(140%)",
                WebkitBackdropFilter: "blur(8px) saturate(140%)",
                pointerEvents: "none",
                overflow: "hidden",
              }}
              initial={{ y: -pxPerHour * 2, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 380,
                  damping: blockSpan > 5 ? 26 : 22,
                  delay: 0.25 + i * 0.08,
                },
              }}
              exit={{
                y: -24,
                opacity: 0,
                transition: {
                  duration: 0.22,
                  ease: "easeIn",
                  delay: i * 0.025,
                },
              }}
            >
              {/* Top inner highlight strip */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
                }}
              />
              {/* Time label */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 14,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {timeLabel}
              </div>

              {/* Title — hidden when block is too short to fit text */}
              {!hideTitle &&
                (isTall ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      color: "#FFFFFF",
                      fontSize: titleSize,
                      fontWeight: 700,
                      letterSpacing: -0.2,
                      paddingInline: 16,
                      textAlign: "center",
                    }}
                  >
                    {slot.title}
                  </div>
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 70,
                      right: 14,
                      color: "#FFFFFF",
                      fontSize: titleSize,
                      fontWeight: 700,
                      letterSpacing: -0.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {slot.title}
                  </div>
                ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

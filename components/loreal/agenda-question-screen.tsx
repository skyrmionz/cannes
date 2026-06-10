"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
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

const IMAGES: ReadonlyArray<string> = [
  "/loreal/agenda-packed.png",
  "/loreal/agenda-curated.png",
  "/loreal/agenda-spontaneous.png",
  "/loreal/agenda-salesforce-forever.png",
];

const NULL_TITLE = "Choose your status";
const NULL_DESCRIPTION = "Select your status above";

const DAY_START = 9;
const DAY_END = 19;
const HOURS = DAY_END - DAY_START; // 10

type Slot = { start: number; end: number; title: string; hue: number };

const SCHEDULES: Record<AgendaIndex, ReadonlyArray<Slot>> = {
  // Packed — every hour. Distinct event types instead of "Event N".
  0: [
    { start: 9, end: 10, title: "Keynote", hue: 200 },
    { start: 10, end: 11, title: "Coffee chat", hue: 30 },
    { start: 11, end: 12, title: "Founders panel", hue: 280 },
    { start: 12, end: 13, title: "Lunch & roundtable", hue: 60 },
    { start: 13, end: 14, title: "Press interview", hue: 340 },
    { start: 14, end: 15, title: "Demo session", hue: 160 },
    { start: 15, end: 16, title: "Investor mixer", hue: 100 },
    { start: 16, end: 17, title: "Brand activation", hue: 320 },
    { start: 17, end: 18, title: "Rooftop happy hour", hue: 20 },
    { start: 18, end: 19, title: "Yacht after-party", hue: 250 },
  ],
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

  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w || 360;
  const isPhone = bodyW < 420;

  const titleText = value === null ? NULL_TITLE : TITLES[value];
  const descText = value === null ? NULL_DESCRIPTION : DESCRIPTIONS[value];
  const titleKey = value === null ? "null" : `t-${value}`;
  const descKey = value === null ? "null" : `d-${value}`;

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
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

      {/* Body */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col"
        style={{
          paddingInline: "16px",
          paddingTop: "clamp(0.75rem, 2vh, 1.5rem)",
          paddingBottom: "clamp(0.5rem, 1.2vh, 1rem)",
          gap: "clamp(0.5rem, 1.2vh, 0.85rem)",
        }}
      >
        {/* Circle picker — 4 round image buttons (above the status title) */}
        <div
          className="relative shrink-0"
          style={{
            paddingTop: "clamp(0.25rem, 1vh, 0.75rem)",
            paddingBottom: "clamp(0.5rem, 1.5vh, 1.25rem)",
          }}
        >
          <div className="flex w-full items-end justify-center" style={{ gap: "clamp(8px, 2.5vw, 18px)" }}>
            {([0, 1, 2, 3] as const).map((i) => (
              <CirclePick
                key={i}
                index={i}
                selected={value === i}
                onSelect={() => onChange(i)}
                isPhone={isPhone}
              />
            ))}
          </div>
        </div>

        {/* Status title row */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ minHeight: isPhone ? 60 : 88 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={titleKey}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              <span
                className="font-bold tracking-tight"
                style={{
                  fontSize: "clamp(2.1rem, min(10vw, 6.2vh), 3.4rem)",
                  whiteSpace: "nowrap",
                  // Same purple→coral gradient as the progress-bar fill,
                  // applied as gradient text via background-clip.
                  background:
                    "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                {titleText}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Description row */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ minHeight: isPhone ? 44 : 64 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={descKey}
              className="absolute inset-0 flex items-center justify-center text-center text-[#001050]/85"
              style={{
                fontSize: "clamp(1.25rem, min(5.4vw, 3.4vh), 1.9rem)",
                fontFamily:
                  'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 400,
                paddingInline: 12,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {descText}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Day-view calendar — fills remaining slack */}
        <div className="relative min-h-0 flex-1">
          <CalendarColumn index={value} />
        </div>

        {/* Hint under the calendar — matches sun/hydration screen format
            (two-line, font-bold, navy 60% opacity, larger clamped scale). */}
        <motion.p
          className="shrink-0 text-center font-bold tracking-tight text-[#001050]/60"
          style={{
            fontSize: "clamp(1.15rem, min(5.6vw, 3.4vh), 1.75rem)",
            paddingTop: "clamp(0.25rem, 0.8vh, 0.6rem)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Tap an icon to choose your status
          <br />
          and click Next
        </motion.p>
      </div>

      {/* Footer */}
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

function CirclePick({
  index,
  selected,
  onSelect,
  isPhone,
}: {
  index: AgendaIndex;
  selected: boolean;
  onSelect: () => void;
  isPhone: boolean;
}) {
  const size = isPhone ? 108 : 152;
  // Outer ring is 6px thicker on each side when selected, so the circle
  // image stays the same size but the gradient ring wraps around it.
  const ringPad = 5;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={TITLES[index]}
      whileTap={{ scale: 0.94 }}
      animate={{ y: selected ? -10 : 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className="relative grid place-items-center rounded-full"
      style={{
        width: size + ringPad * 2,
        height: size + ringPad * 2,
        // Always reserve the ring space so circles don't shift position
        // when selection changes.
        padding: ringPad,
        background: "transparent",
        border: "none",
      }}
    >
      {/* Gradient ring — only visible when selected. Uses the same
          purple→coral palette as the progress bar. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="ring"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            style={{
              background:
                "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Circle content — frosted glass surface (matches the question
          screens' glassmorphism). Sits on top of the gradient ring;
          ring is revealed only via the parent's padding. */}
      <div
        className="relative grid place-items-center overflow-hidden rounded-full"
        style={{
          width: size,
          height: size,
          // Glassy fill — translucent white + saturate backdrop, two
          // inset highlights, soft drop shadow. Mirrors the formula
          // used by the back/next buttons and the progress bar.
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.5) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.55) inset",
            "0 1px 0 rgba(255,255,255,0.85) inset",
            "0 8px 24px rgba(120,160,220,0.22)",
          ].join(", "),
          opacity: selected ? 1 : 0.9,
          transition: "opacity 0.25s ease",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES[index]}
          alt=""
          draggable={false}
          className="select-none"
          style={{
            width: "82%",
            height: "82%",
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      </div>
    </motion.button>
  );
}

function CalendarColumn({ index }: { index: AgendaIndex | null }) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const measuredH = size.h || 0;
  const pxPerHour = Math.max(1, Math.floor(measuredH / HOURS));

  const slots = index === null ? [] : SCHEDULES[index];
  const hideTitle = pxPerHour < 22;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {/* Empty hour-slot containers — clear, just an outline + time label,
          so the calendar always reads as a 9–19 day grid. Visible whether
          or not a status is selected; selected events render on top. */}
      {pxPerHour > 0 && index === null && (
        <div className="absolute inset-0">
          {Array.from({ length: HOURS }).map((_, i) => {
            const hour = DAY_START + i;
            const label = `${String(hour).padStart(2, "0")}:00`;
            return (
              <div
                key={`guide-${i}`}
                className="absolute inset-x-0"
                style={{
                  top: i * pxPerHour,
                  height: pxPerHour - 4,
                  borderRadius: 18,
                  background: "transparent",
                  boxShadow: "0 0 0 1px rgba(0,16,80,0.12) inset",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 16,
                    color: "rgba(0,16,80,0.45)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence initial={false}>
        {slots.map((slot, i) => {
          const top = (slot.start - DAY_START) * pxPerHour;
          const heightPx = (slot.end - slot.start) * pxPerHour - 4;
          const blockSpan = slot.end - slot.start;
          const isTall = heightPx > 80;
          const isFullDay = blockSpan >= HOURS;
          // Full-day blocks (Spontaneous + Salesforce Forever) get a much
          // larger, center-aligned title because they're the marquee element
          // of the calendar — a single statement, not a list item.
          const titleSize = isFullDay ? 56 : isTall ? 22 : 18;
          const timeLabel = `${String(slot.start).padStart(2, "0")}:00`;
          // Mid-curve key includes index so changing agenda forces a remount
          // and the tetris-drop transition fires.
          const k = `${index}-${slot.start}-${slot.end}`;
          return (
            <motion.div
              key={k}
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
              {/* Top inner highlight */}
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
                  top: isTall ? 12 : 8,
                  left: 16,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: isTall ? 14 : 13,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {timeLabel}
              </div>

              {/* Event title — left-aligned for ordinary slots; full-day
                  blocks get a much larger center-aligned title. */}
              {!hideTitle && (
                <div
                  style={{
                    position: "absolute",
                    top: isTall ? "50%" : 6,
                    left: 16,
                    right: 16,
                    transform: isTall ? "translateY(-50%)" : "none",
                    color: "#FFFFFF",
                    fontSize: titleSize,
                    fontWeight: 700,
                    letterSpacing: isFullDay ? -1 : -0.2,
                    textAlign: isFullDay ? "center" : "left",
                    paddingLeft: isFullDay ? 0 : isTall ? 0 : 56,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textShadow: isFullDay
                      ? "0 2px 8px rgba(0,16,80,0.18)"
                      : undefined,
                  }}
                >
                  {slot.title}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";
import {
  FOOTER_BUTTON_STYLE,
  HINT_TEXT_CLASS,
  HINT_TEXT_FONT_SIZE,
  SUBTITLE_FONT_SIZE,
  TITLE_MARGIN_TOP,
} from "./question-shell";

// 3D calendar is lazy-loaded so the three.js bundle only ships when
// the agenda screen actually mounts.
const CalendarColumn3D = dynamic(
  () =>
    import("./agenda-calendar-3d").then((m) => ({
      default: m.CalendarColumn3D,
    })),
  { ssr: false },
);

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

const NULL_TITLE = "Choose your status above";

const DAY_START = 9;
const DAY_END = 19;

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
  3: [{ start: 9, end: 19, title: "Salesforce All Day ☁️", hue: 215 }],
};

export function LorealAgendaQuestionScreen({
  onNext,
  onBack,
  value,
  onChange,
}: Props) {
  // Preload the 3D calendar bundle as soon as the agenda screen
  // mounts so the first circle tap doesn't pay a chunk-load + WebGL
  // init delay.
  useEffect(() => {
    void import("./agenda-calendar-3d");
  }, []);

  const handleNext = () => {
    if (value === null) return;
    onNext();
  };

  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w || 360;
  const isPhone = bodyW < 420;

  const titleText = value === null ? NULL_TITLE : TITLES[value];
  const descText = value === null ? "" : DESCRIPTIONS[value];
  const titleKey = value === null ? "null" : `t-${value}`;
  const descKey = value === null ? "null" : `d-${value}`;

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-20">
        <LorealProgressBar percent={75} label="75%" />
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
          What&apos;s your Cannes
          <br />
          agenda like?
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
                anySelected={value !== null}
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

        {/* Description row — always mounted so the height collapse/expand
            transitions smoothly. Height animates from 0 (null state) to
            the natural row height when a status is selected. */}
        <motion.div
          className="relative shrink-0 overflow-hidden"
          animate={{ height: value === null ? 0 : isPhone ? 44 : 64 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {value !== null && (
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
            )}
          </AnimatePresence>
        </motion.div>

        {/* Day-view calendar — fills remaining slack */}
        <div className="relative min-h-0 flex-1">
          <CalendarColumn3D
            index={value}
            schedules={SCHEDULES}
            dayStart={DAY_START}
            dayEnd={DAY_END}
          />
        </div>

        {/* Hint under the calendar — matches sun/hydration screen format
            via the shared question-shell constants. */}
        <motion.p
          className={HINT_TEXT_CLASS}
          style={{
            fontSize: HINT_TEXT_FONT_SIZE,
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
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-8 pt-2">
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
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={value === null}
          whileHover={value !== null ? { scale: 1.04 } : undefined}
          whileTap={value !== null ? { scale: 0.96 } : undefined}
          className="rounded-full font-semibold text-[#001050] tracking-tight disabled:cursor-not-allowed"
          style={{
            ...FOOTER_BUTTON_STYLE,
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
  anySelected,
  onSelect,
  isPhone,
}: {
  index: AgendaIndex;
  selected: boolean;
  anySelected: boolean;
  onSelect: () => void;
  isPhone: boolean;
}) {
  const size = isPhone ? 108 : 152;
  // Outer ring is 6px thicker on each side when selected, so the circle
  // image stays the same size but the gradient ring wraps around it.
  const ringPad = 5;
  // Dim + shrink unselected siblings when any circle is selected, so the
  // chosen one reads as the focal point.
  const dim = anySelected && !selected;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={TITLES[index]}
      whileTap={{ scale: 0.94 }}
      animate={{
        y: selected ? -10 : 0,
        scale: dim ? 0.78 : 1,
        opacity: dim ? 0.55 : 1,
      }}
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


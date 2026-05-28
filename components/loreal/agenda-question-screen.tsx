"use client";

import { motion, useMotionValue, animate } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";

export type AgendaIndex = 0 | 1 | 2 | 3;

interface Props {
  onNext: () => void;
  onBack: () => void;
  value: AgendaIndex | null;
  onChange: (next: AgendaIndex) => void;
}

const OPTIONS: ReadonlyArray<{
  title: string;
  body: string;
  Icon: () => ReactNode;
}> = [
  {
    title: "Packed",
    body: "Panels, meetings, parties, repeat.",
    Icon: CoffeeCupIcon,
  },
  {
    title: "Curated",
    body: "I know exactly which parties are worth my time.",
    Icon: SparkleIcon,
  },
  {
    title: "Spontaneous.",
    body: "I'll see what kind of trouble I can find.",
    Icon: WavesIcon,
  },
  {
    title: "Salesforce Forever",
    body: "Please don't make me leave the booth.",
    Icon: CloudIcon,
  },
];

export function LorealAgendaQuestionScreen({
  onNext,
  onBack,
  value,
  onChange,
}: Props) {
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();

  // The card that's currently centered in the carousel. Independent of `value`
  // (which only mutates when the user explicitly confirms a card via tap).
  // Seed from `value` so returning to the screen lands on the saved choice.
  const [centerIdx, setCenterIdx] = useState<AgendaIndex>(value ?? 0);

  // Card geometry — width is a fraction of body width so the next card peeks
  // ~10% from each side.
  const cardW = Math.max(220, bodySize.w * 0.78);
  const gap = Math.max(16, bodySize.w * 0.04);
  const stride = cardW + gap;
  const cardH = Math.max(280, Math.min(bodySize.h - 80, cardW * 1.15));

  // Carousel x — negative offsets shift cards left. Stop i sits at -stride * i,
  // with a centering shift so the active card is centered in the body.
  const centerOffset = bodySize.w > 0 ? (bodySize.w - cardW) / 2 : 0;
  const x = useMotionValue(0);

  const stopFor = (i: number) => centerOffset - stride * i;

  // Sync motion value to the current center index whenever geometry shifts.
  useEffect(() => {
    x.set(stopFor(centerIdx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodySize.w, bodySize.h, centerIdx]);

  const goTo = (i: AgendaIndex) => {
    setCenterIdx(i);
    animate(x, stopFor(i), {
      type: "spring",
      stiffness: 380,
      damping: 36,
    });
  };

  const onDragEnd = (
    _e: unknown,
    info: { velocity: { x: number; y: number } },
  ) => {
    const current = x.get();
    // Velocity-aware snap: a flick should advance by one card even if the drag
    // distance is small, so add a fraction of the velocity to the projection.
    const projected = current + info.velocity.x * 0.18;
    let best: AgendaIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < OPTIONS.length; i++) {
      const d = Math.abs(stopFor(i) - projected);
      if (d < bestDist) {
        bestDist = d;
        best = i as AgendaIndex;
      }
    }
    goTo(best);
  };

  const handleNext = () => {
    if (value === null) return;
    onNext();
  };

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-7">
        <LorealProgressBar percent={60} label="60% to glow" />
        <motion.h1
          className="mt-6 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.25rem, min(6vw, 4.2vh), 2.4rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          What&apos;s your Cannes agenda like?
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
          Let&apos;s make sure you&apos;re protected from skin damage.
        </motion.p>
      </div>

      {/* Body — carousel + dots. Centered via flex so vertically balanced
          regardless of header/footer height. */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center"
      >
        <div
          className="relative w-full overflow-visible"
          style={{ height: cardH }}
        >
          <motion.div
            className="absolute top-0 left-0 flex h-full"
            style={{ x, gap: `${gap}px`, touchAction: "pan-y" }}
            drag="x"
            dragMomentum={false}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
          >
            {OPTIONS.map((opt, i) => {
              const isCenter = i === centerIdx;
              const isConfirmed = value === i;
              return (
                <AgendaCard
                  key={opt.title}
                  width={cardW}
                  height={cardH}
                  active={isCenter}
                  confirmed={isConfirmed}
                  title={opt.title}
                  body={opt.body}
                  Icon={opt.Icon}
                  onClick={() => {
                    if (i === centerIdx) {
                      // Tap on the centered card commits the selection.
                      onChange(i as AgendaIndex);
                    } else {
                      goTo(i as AgendaIndex);
                    }
                  }}
                />
              );
            })}
          </motion.div>
        </div>

        {/* Dots indicator */}
        <div className="mt-4 flex items-center gap-2">
          {OPTIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to option ${i + 1}`}
              onClick={() => goTo(i as AgendaIndex)}
              className="rounded-full transition-all"
              style={{
                width: i === centerIdx ? 24 : 8,
                height: 8,
                background:
                  i === centerIdx ? "#001050" : "rgba(0,16,80,0.28)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-30 flex shrink-0 items-center justify-between px-6 pb-6 pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.55)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.7) inset",
              "0 1px 0 rgba(255,255,255,0.85) inset",
              "0 8px 18px rgba(120,160,220,0.25)",
            ].join(", "),
            WebkitBackdropFilter: "blur(10px) saturate(140%)",
            backdropFilter: "blur(10px) saturate(140%)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6 text-[#001050]" strokeWidth={3} />
        </motion.button>
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={value === null}
          whileHover={value !== null ? { scale: 1.04 } : undefined}
          whileTap={value !== null ? { scale: 0.96 } : undefined}
          className="grid h-14 w-14 place-items-center rounded-full disabled:cursor-not-allowed"
          style={{
            background:
              value !== null
                ? "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)"
                : "rgba(255,255,255,0.45)",
            boxShadow:
              value !== null
                ? [
                    "0 1px 0 rgba(255,255,255,0.45) inset",
                    "0 -1px 0 rgba(0,16,80,0.25) inset",
                    "0 0 0 1px rgba(255,255,255,0.25) inset",
                    "0 12px 28px rgba(15,84,200,0.4)",
                  ].join(", ")
                : "0 0 0 1px rgba(0,16,80,0.08) inset, 0 4px 12px rgba(120,160,220,0.18)",
            opacity: value !== null ? 1 : 0.6,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: value !== null ? 1 : 0.6, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          aria-label="Next"
        >
          <ChevronRight
            className="h-6 w-6"
            strokeWidth={3}
            style={{ color: value !== null ? "#FFFFFF" : "#001050" }}
          />
        </motion.button>
      </div>
    </div>
  );
}

function AgendaCard({
  width,
  height,
  active,
  confirmed,
  title,
  body,
  Icon,
  onClick,
}: {
  width: number;
  height: number;
  active: boolean;
  confirmed: boolean;
  title: string;
  body: string;
  Icon: () => ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{
        scale: active ? 1 : 0.92,
        opacity: active ? 1 : 0.6,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="relative shrink-0 overflow-hidden rounded-[28px] text-left"
      style={{
        width,
        height,
        background: "linear-gradient(180deg, #FFFFFF 0%, #EAF3FE 100%)",
        boxShadow: [
          confirmed
            ? "0 0 0 4px #1A6CF0"
            : "0 0 0 1px rgba(0,16,80,0.08)",
          "0 18px 40px rgba(120,160,220,0.20)",
          "0 1px 0 rgba(255,255,255,0.9) inset",
        ].join(", "),
      }}
    >
      <div
        className="flex h-full flex-col"
        style={{ padding: "clamp(20px, 6vw, 32px)" }}
      >
        <h2
          className="font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.6rem, 7vw, 2.6rem)" }}
        >
          {title}
        </h2>
        <p
          className="mt-4 font-bold leading-[1.2] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1rem, 4.4vw, 1.4rem)" }}
        >
          {body}
        </p>
        <div className="mt-auto flex items-end">
          <div
            className="text-[#001050]"
            style={{ width: "44%", aspectRatio: "1 / 1" }}
          >
            <Icon />
          </div>
        </div>
      </div>

      {/* Confirm ring overlay — pulsing inner highlight when confirmed. */}
      {confirmed && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.0, 0.55, 0.0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 0 8px rgba(26,108,240,0.18) inset" }}
        />
      )}
    </motion.button>
  );
}

// Inline SVG icons mirroring the provided refs. All filled in #001050.

function CoffeeCupIcon() {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d="M4 6 H44 C44 26 36 42 30 42 H18 C12 42 4 26 4 6 Z" />
      <path d="M44 12 H50 A8 8 0 0 1 50 28 H46" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d="M32 4 L40 24 L60 32 L40 40 L32 60 L24 40 L4 32 L24 24 Z" />
    </svg>
  );
}

function WavesIcon() {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d="M2 8 Q10 0 18 8 T34 8 T50 8 T62 8" />
      <path d="M2 20 Q10 12 18 20 T34 20 T50 20 T62 20" />
      <path d="M2 32 Q10 24 18 32 T34 32 T50 32 T62 32" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 72 48" fill="currentColor" className="h-full w-full">
      <path d="M50 12 a14 14 0 0 0 -23 -2 a11 11 0 0 0 -16 9 a10 10 0 0 0 -3 19 a13 13 0 0 0 18 4 a12 12 0 0 0 18 -2 a13 13 0 0 0 6 -28 z" />
    </svg>
  );
}

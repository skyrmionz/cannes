"use client";

import { motion, useMotionValue, animate } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  // ~10% from each side. Cap at 480px so cards stay reasonably sized on large
  // monitors (without the cap, 1920px viewport produced 1500px cards that
  // misproportioned the icon/text and clipped against the body height).
  const cardW = Math.min(Math.max(220, bodySize.w * 0.78), 480);
  const gap = Math.max(16, bodySize.w * 0.04);
  const stride = cardW + gap;
  const cardH = Math.min(
    Math.max(280, cardW * 1.25),
    Math.max(280, bodySize.h - 80),
  );

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
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={75} label="75% to glow" />
        <motion.h1
          className="mt-8 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.8rem, min(9vw, 6vh), 3.2rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          What&apos;s your Cannes agenda like?
        </motion.h1>
        <motion.p
          className="mt-3 text-center leading-snug text-[#001050]/75"
          style={{
            fontSize: "clamp(1.05rem, min(4.5vw, 2.8vh), 1.35rem)",
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
                  cardW={cardW}
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
            background: "rgba(255,255,255,0.55)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.7) inset",
              "0 1px 0 rgba(255,255,255,0.85) inset",
              "0 8px 18px rgba(120,160,220,0.25)",
            ].join(", "),
            WebkitBackdropFilter: "blur(10px) saturate(140%)",
            backdropFilter: "blur(10px) saturate(140%)",
            opacity: value !== null ? 1 : 0.4,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: value !== null ? 1 : 0.4, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          aria-label="Next"
        >
          <ChevronRight
            className="h-6 w-6 text-[#001050]"
            strokeWidth={3}
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
  cardW,
  onClick,
}: {
  width: number;
  height: number;
  active: boolean;
  confirmed: boolean;
  title: string;
  body: string;
  Icon: () => ReactNode;
  cardW: number;
  onClick: () => void;
}) {
  // Inner sizing scales with the card itself, not the viewport. With viewport-
  // relative clamps, large monitors made the inside of small (capped) cards
  // misproportioned and clipped. Anchor padding/typography/icon to cardW.
  const padPx = Math.max(20, Math.min(cardW * 0.07, 36));
  const titleFs = Math.max(20, Math.min(cardW * 0.11, 42));
  const bodyFs = Math.max(14, Math.min(cardW * 0.065, 24));
  const iconW = Math.max(60, cardW * 0.4);
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
        style={{ padding: `${padPx}px` }}
      >
        <h2
          className="font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: `${titleFs}px` }}
        >
          {title}
        </h2>
        <p
          className="mt-4 font-bold leading-[1.2] tracking-tight text-[#001050]"
          style={{ fontSize: `${bodyFs}px` }}
        >
          {body}
        </p>
        <div className="mt-auto flex items-end">
          <div
            className="text-[#001050]"
            style={{ width: `${iconW}px`, aspectRatio: "1 / 1" }}
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

      {/* Confirmation check mark — top right corner of the selected card. */}
      {confirmed && (
        <motion.div
          className="pointer-events-none absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 22,
          }}
          style={{
            background:
              "linear-gradient(180deg, #4E90F7 0%, #1A6CF0 60%, #0F54C8 100%)",
            boxShadow:
              "0 0 0 2px #FFFFFF, 0 6px 14px rgba(15,84,200,0.45)",
          }}
        >
          <Check className="h-5 w-5 text-white" strokeWidth={3.5} />
        </motion.div>
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
    <Image
      src="/loreal/icon-spontaneous.png"
      alt=""
      width={400}
      height={250}
      className="h-full w-full select-none object-contain object-left-bottom"
      draggable={false}
    />
  );
}

function CloudIcon() {
  return (
    <Image
      src="/loreal/icon-salesforce.png"
      alt=""
      width={400}
      height={300}
      className="h-full w-full select-none object-contain object-left-bottom"
      draggable={false}
    />
  );
}

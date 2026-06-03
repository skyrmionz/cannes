"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Check } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";

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
  image: string;
}> = [
  {
    title: "Packed",
    body: "Panels, meetings, parties, repeat.",
    image: "/loreal/agenda-packed.png",
  },
  {
    title: "Curated",
    body: "I know exactly which parties are worth my time.",
    image: "/loreal/agenda-curated.png",
  },
  {
    title: "Spontaneous.",
    body: "I'll see what kind of trouble I can find.",
    image: "/loreal/agenda-spontaneous.png",
  },
  {
    title: "Salesforce Forever.",
    body: "Please don't make me leave the booth.",
    image: "/loreal/agenda-salesforce-forever.png",
  },
];

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

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={75} label="75% to glow" />
        <motion.h1
          className="mt-8 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "clamp(1.6rem, min(8vw, 5.5vh), 2.8rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        >
          What&apos;s your Cannes
          <br />
          agenda like?
        </motion.h1>
        <motion.p
          className="mt-3 text-center leading-snug text-[#001050]/75"
          style={{
            fontSize: "clamp(1.05rem, min(4.5vw, 2.6vh), 1.3rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          This is what ties it all together.
        </motion.p>
      </div>

      {/* Body — 2x2 grid of cards. min-h-0 lets the grid shrink to fit. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-4">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
          {OPTIONS.map((opt, i) => (
            <AgendaCard
              key={opt.title}
              title={opt.title}
              body={opt.body}
              image={opt.image}
              selected={value === i}
              onClick={() => onChange(i as AgendaIndex)}
            />
          ))}
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

function AgendaCard({
  title,
  body,
  image,
  selected,
  onClick,
}: {
  title: string;
  body: string;
  image: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] text-left"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #EAF3FE 100%)",
        boxShadow: [
          "0 0 0 1px rgba(0,16,80,0.08)",
          "0 14px 30px rgba(120,160,220,0.18)",
          "0 1px 0 rgba(255,255,255,0.9) inset",
        ].join(", "),
      }}
    >
      {/* Animated gradient border — sits as an absolutely-positioned layer
          behind the card body. When selected, its 4px ring shows through
          the card's inner padding. */}
      {selected && (
        <span
          aria-hidden
          className="agenda-selected-gradient pointer-events-none absolute inset-0 rounded-[24px]"
          style={{
            padding: 4,
            // mask: keep only the 4px outer ring visible
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* Title + subtitle — top section */}
      <div
        className="relative z-10 shrink-0 px-3 pt-3 sm:px-4 sm:pt-4"
        style={{ color: "#001050" }}
      >
        <h2
          className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(0.95rem, min(3.4vw, 2.4vh), 1.4rem)" }}
        >
          {title}
        </h2>
        <p
          className="mt-1 font-bold leading-[1.2] tracking-tight"
          style={{
            fontSize: "clamp(0.7rem, min(2.4vw, 1.6vh), 0.95rem)",
            opacity: 0.85,
          }}
        >
          {body}
        </p>
      </div>

      {/* Image — fills the entire bottom region of the card */}
      <div className="relative mt-1 min-h-0 flex-1">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="select-none object-contain object-bottom"
          draggable={false}
        />
      </div>

      {/* Confirmation check — top-right, gradient-filled when selected */}
      {selected && (
        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-20 grid place-items-center rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{
            width: 32,
            height: 32,
            boxShadow:
              "0 0 0 2px #FFFFFF, 0 6px 14px rgba(15,84,200,0.45)",
          }}
        >
          {/* Animated gradient disc — same keyframe as the ring */}
          <span
            aria-hidden
            className="agenda-selected-gradient absolute inset-0 rounded-full"
          />
          <Check
            className="relative h-4 w-4 text-white"
            strokeWidth={3.5}
          />
        </motion.div>
      )}
    </motion.button>
  );
}

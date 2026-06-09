"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { LorealProgressBar } from "./progress-bar";
import { useElementSize } from "@/lib/use-element-size";

export type AgendaIndex = 0 | 1 | 2 | 3;

interface Props {
  onNext: () => void;
  onBack: () => void;
  value: AgendaIndex | null;
  onChange: (next: AgendaIndex) => void;
}

type Corner = "tl" | "tr" | "bl" | "br";

const OPTIONS: ReadonlyArray<{
  title: string;
  body: string;
  image: string;
  imageCorner: Corner;
  imageScale: number; // size of the image relative to card width
}> = [
  {
    title: "Packed",
    body: "Panels, meetings, parties, repeat.",
    image: "/loreal/agenda-packed.png",
    imageCorner: "br",
    imageScale: 0.7,
  },
  {
    title: "Curated",
    body: "I know exactly which parties are worth my time.",
    image: "/loreal/agenda-curated.png",
    imageCorner: "br",
    imageScale: 0.6,
  },
  {
    title: "Spontaneous",
    body: "I'll see what kind of trouble I can find.",
    image: "/loreal/agenda-spontaneous.png",
    imageCorner: "br",
    imageScale: 0.7,
  },
  {
    title: "Salesforce Forever",
    body: "Please don't make me leave this beach.",
    image: "/loreal/agenda-salesforce-forever.png",
    imageCorner: "br",
    imageScale: 0.65,
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

  // Measure the body region so the 2x2 grid fills it edge-to-edge regardless
  // of viewport (phone, 1080x1920 portrait kiosk, desktop). Cards stretch
  // along whichever axis has slack.
  const { ref: bodyRef, size: bodySize } = useElementSize<HTMLDivElement>();
  const bodyW = bodySize.w || 360;
  const bodyH = bodySize.h || 480;
  const hintReserve = 56;
  const verticalGap = 14;
  const colGap = 14;
  const horizPad = 16;
  const availW = Math.max(160, bodyW - horizPad * 2);
  const availH = Math.max(200, bodyH - hintReserve);
  // Width per card if filling the row; height per card if filling the column.
  const cardWFill = (availW - colGap) / 2;
  const cardHFill = (availH - verticalGap) / 2;
  // Cards fill the row but only ~88% of the available column height so they
  // read as cards (not blocks). Cap aspect at min 1.0 (square) and max 1.15
  // so the proportion stays consistent across resolutions.
  const cardW = cardWFill;
  const minH = cardW * 1.0;
  const maxH = cardW * 1.15;
  const cardH = Math.max(minH, Math.min(cardHFill * 0.88, maxH));

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px]">
      {/* Header — matches sun/hydration question format */}
      <div className="relative z-30 shrink-0 px-7 pt-12">
        <LorealProgressBar percent={75} label="75% to glow" />
        <motion.h1
          className="mt-12 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
          style={{ fontSize: "min(10vw, 6vh)" }}
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
            fontSize: "min(5vw, 2.4vh)",
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

      {/* Body — 2x2 grid of cards + hint below. Cards are sized by their
          aspect ratio; gridAutoRows keeps rows tight so the hint stays
          within the body region. */}
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center"
        style={{
          paddingInline: `${horizPad}px`,
          paddingBlock: "clamp(0.5rem, 1.5vh, 1rem)",
          gap: "clamp(0.5rem, 1.5vh, 1rem)",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${cardW}px ${cardW}px`,
            gridAutoRows: `${cardH}px`,
            gap: `${verticalGap}px ${colGap}px`,
          }}
        >
          {OPTIONS.map((opt, i) => (
            <AgendaCard
              key={opt.title}
              title={opt.title}
              body={opt.body}
              image={opt.image}
              imageCorner={opt.imageCorner}
              imageScale={opt.imageScale}
              cardW={cardW}
              cardH={cardH}
              selected={value === i}
              onClick={() => onChange(i as AgendaIndex)}
            />
          ))}
        </div>

        {/* Hint — single line, matching the sun/hydration hint style */}
        <motion.p
          className="shrink-0 whitespace-nowrap text-center font-bold leading-tight tracking-tight text-[#001050]/60"
          style={{ fontSize: "clamp(0.85rem, min(4vw, 2.4vh), 1.3rem)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Select and click next
        </motion.p>
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
  imageCorner,
  imageScale,
  cardW,
  cardH,
  selected,
  onClick,
}: {
  title: string;
  body: string;
  image: string;
  imageCorner: Corner;
  imageScale: number;
  cardW: number;
  cardH: number;
  selected: boolean;
  onClick: () => void;
}) {
  // Scale typography off the smaller card dimension so text fills the card
  // proportionally at every viewport size (phone, 1080x1920, desktop).
  const baseDim = Math.min(cardW, cardH);
  const titleSize = Math.max(16, Math.min(baseDim * 0.18, 36));
  const bodySize = Math.max(12, Math.min(baseDim * 0.095, 22));
  const padTop = Math.max(12, baseDim * 0.08);
  const padLeft = Math.max(14, baseDim * 0.09);
  // Image sits flush against the card's corner, fully visible inside the card.
  const cornerStyle: Record<Corner, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="relative h-full w-full overflow-hidden rounded-[28px] text-left"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #EAF3FE 100%)",
        boxShadow: [
          "0 0 0 1px rgba(0,16,80,0.08)",
          "0 14px 30px rgba(120,160,220,0.18)",
          "0 1px 0 rgba(255,255,255,0.9) inset",
        ].join(", "),
      }}
    >
      {/* Image — anchored to a specific corner and translated past the
          edge so the card's overflow-hidden clips it into the rounded
          corner. Painted under the text via z-0. */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          ...cornerStyle[imageCorner],
          width: `${imageScale * 100}%`,
          aspectRatio: "1 / 1",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-contain"
          style={{ objectPosition: cornerToObjectPosition(imageCorner) }}
        />
      </div>

      {/* Animated gradient border ring */}
      {selected && (
        <span
          aria-hidden
          className="agenda-selected-gradient pointer-events-none absolute inset-0 z-30 rounded-[28px]"
          style={{
            padding: 4,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* Title + body — pushed down and right so they don't sit jammed
          against the corner. Larger type per reference mockup. */}
      <div
        className="relative z-10 flex h-full flex-col"
        style={{
          color: "#001050",
          paddingTop: padTop,
          paddingLeft: padLeft,
          paddingRight: Math.max(10, cardW * 0.06),
        }}
      >
        <h2
          className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: titleSize }}
        >
          {title}
        </h2>
        <p
          className="font-bold leading-[1.2] tracking-tight"
          style={{
            fontSize: bodySize,
            marginTop: Math.max(6, baseDim * 0.04),
            opacity: 0.85,
            maxWidth: "82%",
          }}
        >
          {body}
        </p>
      </div>

      {/* Confirmation check — top-right, gradient-filled when selected */}
      {selected && (
        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-40 grid place-items-center rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{
            width: 36,
            height: 36,
            boxShadow:
              "0 0 0 2px #FFFFFF, 0 6px 14px rgba(15,84,200,0.45)",
          }}
        >
          <span
            aria-hidden
            className="agenda-selected-gradient absolute inset-0 rounded-full"
          />
          <Check
            className="relative h-5 w-5 text-white"
            strokeWidth={3.5}
          />
        </motion.div>
      )}
    </motion.button>
  );
}

function cornerToObjectPosition(corner: Corner): string {
  switch (corner) {
    case "tl":
      return "left top";
    case "tr":
      return "right top";
    case "bl":
      return "left bottom";
    case "br":
      return "right bottom";
  }
}

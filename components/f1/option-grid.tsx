"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { KnobOption } from "./knob-question-screen";

interface OptionGridProps {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// All team logos are dark-on-transparent — invert them on the blue background
const INVERT_LOGOS = new Set([
  "red-bull", "ferrari", "mclaren", "mercedes", "aston-martin",
  "racing-bulls", "alpine", "williams", "haas", "audi", "cadillac",
]);

export function OptionGrid({ options, selectedId, onSelect }: OptionGridProps) {
  const cols = options.length <= 6 ? 2 : 3;
  const isCompact = options.length > 6;

  return (
    <div
      className="grid w-full gap-2 px-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {options.map((opt, i) => {
        const selected = opt.id === selectedId;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: i * 0.035,
              type: "spring",
              stiffness: 420,
              damping: 28,
            }}
            whileTap={{ scale: 0.88 }}
            className="relative flex flex-col items-center justify-center gap-1 rounded-2xl text-center focus:outline-none overflow-hidden"
            style={{
              minHeight: isCompact ? 72 : 88,
              padding: isCompact ? "8px 6px" : "10px 8px",
              background: selected
                ? "rgba(0, 179, 255, 0.15)"
                : "rgba(0, 20, 80, 0.55)",
              border: `2px solid ${selected ? "#00B3FF" : "rgba(255,255,255,0.12)"}`,
              boxShadow: selected
                ? "0 0 16px rgba(0,179,255,0.5), inset 0 0 12px rgba(0,179,255,0.08)"
                : "none",
              backdropFilter: "blur(8px)",
              transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
            }}
          >
            {/* Thumb */}
            <OptionThumb option={opt} size={isCompact ? 28 : 36} />

            {/* Label */}
            <span
              className="font-bold uppercase leading-tight tracking-wide"
              style={{
                fontSize: isCompact ? 9 : 10,
                color: selected ? "#00B3FF" : "rgba(255,255,255,0.9)",
                letterSpacing: "0.06em",
              }}
            >
              {opt.label}
            </span>

            {/* Subtitle — only for ≤6 options */}
            {!isCompact && opt.subtitle && (
              <span className="text-[8px] text-white/40 leading-none">{opt.subtitle}</span>
            )}

            {/* Neon selection ring pulse */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="ring"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: "inset 0 0 0 2px #00B3FF",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Checkmark badge */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="check"
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ background: "#00B3FF" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="#001050" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

function OptionThumb({ option, size }: { option: KnobOption; size: number }) {
  const dim = { width: size, height: size };
  const shouldInvert = option.logo && INVERT_LOGOS.has(option.id);

  if (option.logo) {
    return (
      <div className="relative flex-shrink-0" style={dim}>
        <Image
          src={option.logo}
          alt={option.label}
          fill
          unoptimized
          className={`object-contain ${shouldInvert ? "brightness-0 invert" : ""}`}
        />
      </div>
    );
  }
  if (option.emoji) {
    return (
      <span style={{ fontSize: size * 0.85, lineHeight: 1 }} className="select-none">
        {option.emoji}
      </span>
    );
  }
  if (option.image) {
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg" style={dim}>
        <Image src={option.image} alt={option.label} fill unoptimized className="object-cover" />
      </div>
    );
  }
  return <div className="flex-shrink-0 rounded-lg bg-white/10" style={dim} />;
}

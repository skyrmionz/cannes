"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogoHeader, AstroAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";

interface NameEntryProps {
  driverName: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
  onOptInChange?: (v: boolean) => void;
}

export function NameEntry({
  driverName,
  onNameChange,
  onNext,
  onBack,
  onOptInChange,
}: NameEntryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRef = useRef<HTMLLabelElement>(null);
  const [optIn, setOptIn] = useState(false);
  const [highlightCheckbox, setHighlightCheckbox] = useState(false);

  // Focus name input as soon as GDPR is ticked
  useEffect(() => {
    if (optIn) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [optIn]);

  const triggerCheckboxAlert = () => {
    setHighlightCheckbox(true);
    checkboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightCheckbox(false), 2500);
  };

  const handleOptInChange = (v: boolean) => {
    setOptIn(v);
    if (v) setHighlightCheckbox(false);
    onOptInChange?.(v);
  };

  // Block the input entirely until opted in
  const handleInputFocus = () => {
    if (!optIn) {
      inputRef.current?.blur();
      triggerCheckboxAlert();
    }
  };

  const handleInputClick = () => {
    if (!optIn) triggerCheckboxAlert();
  };

  const canProceed = driverName.trim().length > 0 && optIn;

  const handleNext = () => {
    if (!optIn) { triggerCheckboxAlert(); return; }
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed) onNext();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      {/* Progress bar */}
      <div className="relative z-10 h-1 w-full bg-white/20">
        <div className="h-full bg-white" style={{ width: "20%" }} />
      </div>

      {/* Logos */}
      <div className="relative z-10 pt-6">
        <LogoHeader className="justify-center" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <AstroAvatar className="mb-6 h-28 w-28 md:h-36 md:w-36" />
        </motion.div>

        <motion.h2
          className="text-center text-2xl font-bold uppercase tracking-[0.15em] text-white md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          What&apos;s your name, driver?
        </motion.h2>

        <motion.p
          className="mt-2 text-center text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          We&apos;re making you the title track.
        </motion.p>

        {/* GDPR opt-in — shown first, above the input */}
        <motion.label
          ref={checkboxRef}
          className="mt-8 flex w-full max-w-sm cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-xs transition-colors"
          style={{
            borderColor: highlightCheckbox ? "#ff4444" : "transparent",
            backgroundColor: highlightCheckbox ? "rgba(255,68,68,0.08)" : "rgba(255,255,255,0.06)",
            color: highlightCheckbox ? "white" : "rgba(255,255,255,0.65)",
          }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <motion.div
            animate={highlightCheckbox ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-0.5 flex-shrink-0"
          >
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => handleOptInChange(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
          </motion.div>
          <span>
            Opt in for a personalised title track only. We never sell your data.
          </span>
        </motion.label>

        {/* Inline error */}
        <AnimatePresence>
          {highlightCheckbox && (
            <motion.p
              className="mt-1.5 text-[11px] font-semibold text-red-400"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Please agree to continue
            </motion.p>
          )}
        </AnimatePresence>

        {/* Name input — visually locked until opted in */}
        <motion.div
          className="mt-4 w-full max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={driverName}
            onChange={(e) => optIn && onNameChange(e.target.value)}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            placeholder={optIn ? "Your name" : "Agree above to unlock"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="driver-name"
            readOnly={!optIn}
            className={`w-full rounded-xl border px-6 py-4 text-center text-lg font-semibold outline-none transition-all ${
              optIn
                ? "cursor-text border-white/20 bg-white text-[#001050] placeholder-[#001050]/40 focus:border-white focus:ring-2 focus:ring-white/30"
                : "cursor-not-allowed border-white/10 bg-white/10 text-white/30 placeholder-white/30"
            }`}
          />
        </motion.div>

        <motion.div
          className="mt-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className={`rounded-full px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] shadow-lg transition-all ${
              canProceed
                ? "bg-white text-[#001050] hover:opacity-90"
                : "cursor-pointer bg-white/30 text-white/50"
            }`}
          >
            Next
          </button>
        </motion.div>
      </div>
    </div>
  );
}

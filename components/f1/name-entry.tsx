"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
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
  const [optIn, setOptIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && driverName.trim()) {
      onNext();
    }
  };

  const handleOptInChange = (v: boolean) => {
    setOptIn(v);
    onOptInChange?.(v);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      {/* Progress bar — step 1 of 4 questions (pre-questions, show at 20%) */}
      <div className="relative z-10 h-1 w-full bg-white/20">
        <div className="h-full bg-white" style={{ width: "20%" }} />
      </div>

      {/* Logos pinned to top */}
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

        <motion.input
          ref={inputRef}
          type="text"
          value={driverName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your name"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          name="driver-name"
          className="mt-8 w-full max-w-sm rounded-xl border border-white/20 bg-white px-6 py-4 text-center text-lg font-semibold text-[#001050] placeholder-[#001050]/40 outline-none transition-all focus:border-white focus:ring-2 focus:ring-white/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        />

        {/* GDPR opt-in */}
        <motion.label
          className="mt-4 flex max-w-sm cursor-pointer items-center gap-2 text-xs text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => handleOptInChange(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Opt in for personalised quiz results only. We never sell your data.
        </motion.label>

        <motion.div
          className="mt-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!driverName.trim()}
            className="rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001050] shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </motion.div>
      </div>
    </div>
  );
}

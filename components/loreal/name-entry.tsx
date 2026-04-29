"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";
import { LorealBg } from "./loreal-bg";

interface NameEntryProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function NameEntry({ name, onNameChange, onNext, onBack }: NameEntryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      onNext();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <LorealBg />

      <div className="relative z-10 flex flex-col items-center">
        <LogoHeader className="mb-16" />

        <motion.h2
          className="text-center font-serif text-3xl font-light tracking-wide text-white md:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          What&apos;s your name?
        </motion.h2>

        <motion.input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your name"
          className="mt-10 w-full max-w-sm rounded-sm border border-neutral-700 bg-[#1a1a1a] px-6 py-4 text-center font-serif text-lg text-white placeholder-neutral-500 outline-none transition-all focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />

        <motion.div
          className="mt-10 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="rounded-sm border border-neutral-700 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#C8A96E] hover:text-white"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!name.trim()}
            className="rounded-sm bg-[#C8A96E] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#D4BC8A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </motion.div>
      </div>
    </div>
  );
}

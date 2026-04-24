"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { LogoHeader } from "./logo-header";

export interface QuestionOption {
  id: string;
  label: string;
  description: string;
  image?: string;
}

interface QuestionScreenProps {
  title: string;
  options: QuestionOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function QuestionScreen({
  title,
  options,
  selectedId,
  onSelect,
  onBack,
}: QuestionScreenProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [title]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  const hasImages = options.some((o) => o.image);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <LogoHeader className="mb-10" />

      <motion.h2
        className="mb-8 text-center text-2xl font-semibold uppercase tracking-[0.2em] text-white md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option, i) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`overflow-hidden rounded-sm border text-left transition-all ${
              selectedId === option.id
                ? "border-[#E10600] bg-[#1a1a1a] shadow-[0_0_20px_rgba(225,6,0,0.25)] scale-[1.03]"
                : "border-neutral-800 bg-[#1a1a1a] hover:border-neutral-600 hover:scale-[1.02]"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
          >
            {option.image && (
              <div className="relative h-28 w-full bg-[#111] md:h-32">
                <Image
                  src={option.image}
                  alt={option.label}
                  fill
                  className={`${hasImages && option.image.includes("drivers") ? "object-contain object-bottom" : "object-cover"}`}
                />
              </div>
            )}
            <div className="p-5">
              <div className="text-base font-semibold uppercase tracking-wider text-white md:text-lg">
                {option.label}
              </div>
              <div className="mt-1 text-sm text-[#b0b0b0]">
                {option.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={onBack}
        className="mt-8 rounded-sm border border-neutral-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#E10600] hover:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Back
      </motion.button>
    </div>
  );
}

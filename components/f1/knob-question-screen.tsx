"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { LogoHeader, AstroAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";

export interface KnobOption {
  id: string;
  label: string;
  subtitle?: string;
  description: string;
  image?: string;
  emoji?: string;
  logo?: string;
  drivers?: string;
  character?: boolean;
  melodyGroup?: string;
}

interface KnobQuestionScreenProps {
  title: string;
  subtitle: string;
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

export function KnobQuestionScreen({
  title,
  subtitle,
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
  stepIndex,
  totalSteps,
}: KnobQuestionScreenProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Progress bar — flush to top, no border-radius */}
      <div className="relative z-10 h-1 w-full bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Logos */}
      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

      {/* Question header with Astro top-left */}
      <div className="relative z-10 px-5 pt-4">
        <div className="flex items-start gap-3">
          <AstroAvatar className="mt-0.5 h-8 w-8 flex-shrink-0" />
          <div>
            <motion.h2
              className="text-base font-bold uppercase leading-snug tracking-[0.1em] text-white"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-0.5 text-[11px] text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Card list — scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          {options.map((option, i) => {
            const isSelected = option.id === selectedId;

            // Circuit question: try neon outline image first
            const circuitNeon =
              option.image?.includes("/circuits/photos/")
                ? option.image
                    .replace("/circuits/photos/", "/circuits/")
                    .replace(/\.(jpg|png)$/, ".png")
                : null;

            return (
              <motion.button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left backdrop-blur-sm transition-colors ${
                  isSelected
                    ? "border-white bg-white/20"
                    : "border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15"
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              >
                {/* Thumbnail */}
                {option.logo ? (
                  /* Team card — logo */
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                    <Image
                      src={option.logo}
                      alt={option.label}
                      fill
                      unoptimized
                      className={`object-contain p-1 ${
                        ["mercedes", "aston-martin", "audi", "cadillac"].includes(option.id)
                          ? "brightness-0 invert"
                          : ""
                      }`}
                    />
                  </div>
                ) : option.emoji ? (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-2xl">
                    {option.emoji}
                  </div>
                ) : option.image ? (
                  /* Circuit / celebration — try neon outline for circuits */
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                    <Image
                      src={circuitNeon ?? option.image}
                      alt={option.label}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        // Fall back to photo if neon outline not found
                        if (circuitNeon && e.currentTarget.src.includes(circuitNeon.split("/").pop()!)) {
                          e.currentTarget.src = option.image!;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-white/10" />
                )}

                {/* Label + subtitle */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold uppercase tracking-wide text-white">
                    {option.label}
                  </p>
                  {(option.subtitle ?? option.drivers) && (
                    <p className="mt-0.5 truncate text-[11px] text-white/50">
                      {option.subtitle ?? option.drivers}
                    </p>
                  )}
                </div>

                {/* Checkmark when selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="flex-shrink-0 text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-4 pb-5 pt-2">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
          >
            Back
          </button>

          <AnimatePresence>
            {selectedId && (
              <motion.button
                onClick={onNext}
                className="rounded-full bg-white px-8 py-2.5 text-sm font-bold uppercase tracking-[0.15em] text-[#001050] shadow-lg transition-opacity hover:opacity-90"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                Next
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

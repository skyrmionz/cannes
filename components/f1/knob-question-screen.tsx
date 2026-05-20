"use client";

import { motion, AnimatePresence } from "motion/react";
import { LogoHeader, AstroAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { TrackDragSelector } from "./track-drag-selector";

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
  musicNote?: string;
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

      {/* Progress bar */}
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

      {/* Question header */}
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

      {/* Drag selector — vertically centered */}
      <div className="relative z-10 flex flex-1 flex-col justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <TrackDragSelector
            options={options}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </motion.div>
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

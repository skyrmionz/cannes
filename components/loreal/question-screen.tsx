"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Sparkles,
  Layers,
  Gem,
  Droplets,
  Sun,
  CircleDot,
  Heart,
  Sparkle,
  Droplet,
  FlaskConical,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoHeader } from "./logo-header";

export interface LorealOption {
  id: string;
  label: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  sparkles: Sparkles,
  layers: Layers,
  gem: Gem,
  droplets: Droplets,
  sun: Sun,
  "circle-dot": CircleDot,
  heart: Heart,
  sparkle: Sparkle,
  droplet: Droplet,
  flask: FlaskConical,
  shield: ShieldCheck,
};

interface QuestionScreenProps {
  title: string;
  options: LorealOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuestionScreen({
  title,
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Dot background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#0a0a0a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,169,110,0.06)_0%,transparent_60%)]" />

      {/* Top section */}
      <div className="relative z-10 px-6 pt-8 md:px-12 md:pt-10">
        <LogoHeader className="mb-8 md:mb-10" />
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-2 h-[2px] w-16 bg-[#C8A96E]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <motion.h2
            className="font-serif text-2xl font-light tracking-wide text-white md:text-3xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {title}
          </motion.h2>
        </div>
      </div>

      {/* Center selection area */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="mx-auto flex flex-wrap justify-center gap-3 md:gap-4">
          {options.map((option, i) => {
            const Icon = iconMap[option.icon];
            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "group flex w-36 flex-col items-center gap-4 rounded-sm border p-6 transition-all md:w-44 md:p-8",
                  selectedId === option.id
                    ? "border-[#C8A96E] bg-[#1a1a1a] shadow-[0_0_24px_rgba(200,169,110,0.2)]"
                    : "border-neutral-800 bg-[#111] hover:border-neutral-500 hover:bg-[#1a1a1a]"
                )}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.45 }}
              >
                <div
                  className={cn(
                    "h-[2px] w-full -mt-6 -mx-6 mb-2 transition-colors",
                    "md:-mt-8 md:-mx-8",
                    "w-[calc(100%+3rem)] md:w-[calc(100%+4rem)]",
                    selectedId === option.id
                      ? "bg-[#C8A96E]"
                      : "bg-transparent group-hover:bg-neutral-700"
                  )}
                />
                {Icon && (
                  <Icon
                    className={cn(
                      "h-7 w-7 transition-colors",
                      selectedId === option.id
                        ? "text-[#C8A96E]"
                        : "text-neutral-400 group-hover:text-neutral-300"
                    )}
                    strokeWidth={1.5}
                  />
                )}
                <span
                  className={cn(
                    "text-center font-serif text-sm leading-tight transition-colors md:text-base",
                    selectedId === option.id ? "text-white" : "text-neutral-300"
                  )}
                >
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="relative z-10 px-4 pb-8 md:px-8 md:pb-12">
        <motion.div
          className="mx-auto flex max-w-5xl items-center justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <AnimatePresence>
            {selectedId && (
              <motion.button
                onClick={onNext}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#C8A96E] text-xs font-bold leading-none text-white">
                  N
                </span>
                Next
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-xs font-bold leading-none text-white">
              B
            </span>
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}

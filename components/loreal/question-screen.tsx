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
  SunMoon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedBorder } from "@/components/ui/animated-border";
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
  "sun-moon": SunMoon,
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
    <AuroraBackground className="!h-auto min-h-screen !bg-white" showRadialGradient>
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {/* Top section — logo only */}
        <div className="px-6 pt-8 md:px-12 md:pt-10">
          <LogoHeader className="mb-4" />
        </div>

        {/* Center area — question title tight above cards */}
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mx-auto max-w-4xl w-full flex flex-col items-center">
            <motion.div
              className="mb-2 h-[2px] w-16 bg-[#C8A96E]"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.h2
              className="mb-6 text-center font-serif text-2xl font-light tracking-wide text-neutral-800 md:text-3xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {title}
            </motion.h2>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {options.map((option, i) => {
                const Icon = iconMap[option.icon];
                const isSelected = selectedId === option.id;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="rounded-sm"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.45 }}
                  >
                    <AnimatedBorder
                      active={isSelected}
                      className={cn(
                        "rounded-sm",
                        !isSelected && "border border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      )}
                    >
                      <div
                        className={cn(
                          "group flex w-36 flex-col items-center gap-4 rounded-sm p-6 transition-all md:w-44 md:p-8"
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-7 w-7 transition-colors",
                              isSelected
                                ? "text-[#C8A96E]"
                                : "text-neutral-400 group-hover:text-neutral-500"
                            )}
                            strokeWidth={1.5}
                          />
                        )}
                        <span
                          className={cn(
                            "text-center font-serif text-sm leading-tight transition-colors md:text-base",
                            isSelected ? "text-neutral-800" : "text-neutral-500"
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    </AnimatedBorder>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="px-4 pb-8 md:px-8 md:pb-12">
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
                  className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-neutral-700"
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
              className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-300 text-xs font-bold leading-none text-white">
                B
              </span>
              Back
            </button>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}

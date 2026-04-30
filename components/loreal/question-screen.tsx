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
import { AnimatedBorder } from "@/components/ui/animated-border";

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
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-4xl w-full flex flex-col items-center">
            <motion.div
              className="mb-2 h-[2px] w-16 bg-[#C8A96E]"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.h2
              className="mb-6 text-center font-serif text-2xl font-light tracking-wide text-white md:text-3xl"
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
                      className="rounded-sm"
                    >
                      <div className="group flex h-32 w-36 flex-col items-center justify-center gap-4 rounded-sm p-4 md:h-36 md:w-44 md:p-6">
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-7 w-7 transition-colors duration-500",
                              isSelected
                                ? "text-[#C8A96E]"
                                : "text-white/50 group-hover:text-white/70"
                            )}
                            strokeWidth={1.5}
                          />
                        )}
                        <span
                          className={cn(
                            "text-center font-serif text-sm leading-tight transition-colors duration-500 md:text-base",
                            isSelected ? "text-white" : "text-white/60"
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
                className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/70"
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
            className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/70"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-white/20 text-xs font-bold leading-none text-white">
              B
            </span>
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}

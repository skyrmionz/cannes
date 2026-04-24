"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
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
  const isDrivers = hasImages && options[0]?.image?.includes("drivers");

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

      {/* Top section: logo + title with red accent line */}
      <div className="relative z-10 px-6 pt-8 md:px-12 md:pt-10">
        <LogoHeader className="mb-8 md:mb-10" />
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-2 h-[2px] w-16 bg-[#E10600]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <motion.h2
            className="text-2xl font-semibold uppercase tracking-[0.15em] text-white md:text-3xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {title}
          </motion.h2>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section: horizontal card row */}
      <div className="relative z-10 px-4 pb-20 md:px-8">
        <div
          className={cn(
            "mx-auto flex gap-3 md:gap-4",
            "max-w-5xl",
            "overflow-x-auto",
            "justify-center"
          )}
        >
          {options.map((option, i) => (
            <motion.button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "group flex-shrink-0 overflow-hidden rounded-sm border text-left transition-all",
                hasImages ? "w-44 md:w-56" : "w-44 md:w-52",
                selectedId === option.id
                  ? "border-[#E10600] bg-[#1a1a1a] shadow-[0_0_24px_rgba(225,6,0,0.3)] scale-[1.05]"
                  : "border-neutral-800 bg-[#111] hover:border-neutral-500 hover:scale-[1.03] hover:bg-[#1a1a1a]"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.45 }}
            >
              {/* Red accent line at top of selected card */}
              <div
                className={cn(
                  "h-[2px] w-full transition-colors",
                  selectedId === option.id ? "bg-[#E10600]" : "bg-transparent group-hover:bg-neutral-700"
                )}
              />

              {option.image && (
                <div
                  className={cn(
                    "relative w-full bg-[#0a0a0a]",
                    isDrivers ? "h-32 md:h-40" : "h-24 md:h-28"
                  )}
                >
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className={
                      isDrivers
                        ? "object-contain object-bottom"
                        : "object-contain p-2"
                    }
                  />
                </div>
              )}

              <div className="p-3 md:p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-white md:text-sm">
                  {option.label}
                </div>
                <div className="mt-0.5 text-[11px] text-[#b0b0b0] md:text-xs">
                  {option.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Back button at bottom-right like F1 game */}
        <motion.div
          className="mx-auto mt-6 flex max-w-5xl justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-xs font-bold text-white">
              B
            </span>
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}

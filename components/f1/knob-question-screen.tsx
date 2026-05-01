"use client";

import { useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { RotaryKnob } from "./rotary-knob";

export interface KnobOption {
  id: string;
  label: string;
  subtitle?: string;
  description: string;
  image: string;
  logo?: string;
  drivers?: string;
}

interface KnobQuestionScreenProps {
  title: string;
  subtitle: string;
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function KnobQuestionScreen({
  title,
  subtitle,
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: KnobQuestionScreenProps) {
  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.id === selectedId),
    [options, selectedId]
  );

  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      onSelect(options[0].id);
    }
  }, [selectedId, options, onSelect]);

  const handleIndexChange = useCallback(
    (index: number) => {
      if (index >= 0 && index < options.length) {
        onSelect(options[index].id);
      }
    },
    [options, onSelect]
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Logos pinned to top center */}
      <div className="relative z-10 pt-8">
        <LogoHeader className="justify-center" />
      </div>

      {/* Title with Slackbot */}
      <div className="relative z-10 px-6 pt-6 md:px-12 md:pt-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-2 h-[2px] w-16 bg-[#E10600]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <div className="flex items-center gap-4">
            <SlackbotAvatar className="h-12 w-12 flex-shrink-0 md:h-14 md:w-14" />
            <div>
              <motion.h2
                className="text-2xl font-semibold uppercase tracking-[0.15em] text-white md:text-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {title}
              </motion.h2>
              <motion.p
                className="mt-1 text-xs text-[#b0b0b0] md:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {subtitle}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pt-6 md:pt-8">
        <AnimatePresence mode="wait">
          {selectedOption ? (
            <motion.div
              key={selectedOption.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {selectedOption.logo ? (
                /* Team preview: car background + logo + drivers + description */
                <div className="relative flex flex-col items-center">
                  <div className="relative h-44 w-80 md:h-56 md:w-[28rem]">
                    <Image
                      src={selectedOption.image}
                      alt={selectedOption.label}
                      fill
                      className="object-contain opacity-30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-16 w-16 md:h-20 md:w-20">
                        <Image
                          src={selectedOption.logo}
                          alt={`${selectedOption.label} logo`}
                          fill
                          className="object-contain brightness-0 invert"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  {selectedOption.drivers && (
                    <p className="mt-0.5 text-xs text-[#b0b0b0]">
                      {selectedOption.drivers}
                    </p>
                  )}
                  {selectedOption.description && (
                    <p className="mt-1.5 max-w-md text-center text-xs text-neutral-400">
                      {selectedOption.description}
                    </p>
                  )}
                </div>
              ) : selectedOption.description ? (
                <>
                  <div className="relative h-40 w-72 overflow-hidden rounded-sm md:h-52 md:w-96">
                    <Image
                      src={selectedOption.image}
                      alt={selectedOption.label}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 border border-neutral-700" />
                  </div>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  {selectedOption.subtitle && (
                    <p className="mt-0.5 text-xs text-[#b0b0b0]">
                      {selectedOption.subtitle}
                    </p>
                  )}
                  <p className="mt-2 whitespace-nowrap text-center text-xs text-neutral-400">
                    {selectedOption.description}
                  </p>
                </>
              ) : (
                <>
                  <div className="relative h-32 w-32 md:h-40 md:w-40">
                    <Image
                      src={selectedOption.image}
                      alt={selectedOption.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-4 text-lg font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="placeholder"
              className="text-sm uppercase tracking-wider text-neutral-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Turn the knob below
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Rotary knob */}
      <div className="relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <RotaryKnob
            options={options}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
            onIndexChange={handleIndexChange}
          />
        </motion.div>
      </div>

      {/* Navigation buttons */}
      <div className="relative z-10 px-4 pb-6 pt-4 md:px-8 md:pb-10">
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
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#E10600] text-xs font-bold leading-none text-white">
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

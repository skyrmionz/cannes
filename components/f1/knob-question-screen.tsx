"use client";

import { useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { SliderSelector } from "./slider-selector";
import { PixelCharacter } from "./pixel-character";

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

  // Slider zones 0–9 → map evenly across 5 options (2 zones each)
  // A → Next, B → Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (/^[0-9]$/.test(e.key)) {
        const zone = parseInt(e.key);
        const index = Math.round((zone / 9) * (options.length - 1));
        handleIndexChange(Math.max(0, Math.min(options.length - 1, index)));
        return;
      }

      if (e.key === "a" || e.key === "A") {
        if (selectedId) onNext();
        return;
      }
      if (e.key === "b" || e.key === "B") {
        onBack();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, selectedId, handleIndexChange, onNext, onBack]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Logos */}
      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

      {/* Question header */}
      <div className="relative z-10 px-5 pt-3">
        <motion.div
          className="mb-2 h-[2px] w-12 bg-[#E10600]"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        />
        <div className="flex items-start gap-3">
          <SlackbotAvatar className="mt-0.5 h-8 w-8 flex-shrink-0" />
          <div>
            <motion.h2
              className="text-base font-semibold uppercase leading-snug tracking-[0.12em] text-white"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-0.5 text-[11px] text-[#b0b0b0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Preload every option image so slider is instant */}
      <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        {options.map((o) => (
          <span key={o.id}>
            {o.image && <Image src={o.image} alt="" width={1} height={1} unoptimized priority />}
            {o.logo  && <Image src={o.logo}  alt="" width={1} height={1} unoptimized priority />}
          </span>
        ))}
      </div>

      {/* Preview — fills remaining space */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-4">
        <AnimatePresence mode="wait">
          {selectedOption ? (
            <motion.div
              key={selectedOption.id}
              className="flex w-full flex-col items-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              {selectedOption.logo ? (
                /* Team: car + logo overlay */
                <div className="flex flex-col items-center">
                  <div className="relative h-44 w-full max-w-xs">
                    <Image
                      src={selectedOption.image!}
                      alt={selectedOption.label}
                      fill
                      unoptimized
                      priority
                      className="object-contain opacity-25"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-20 w-20">
                        <Image
                          src={selectedOption.logo}
                          alt={`${selectedOption.label} logo`}
                          fill
                          unoptimized
                          priority
                          className={`object-contain ${
                            ["mercedes", "aston-martin", "audi", "cadillac"].includes(selectedOption.id)
                              ? "brightness-0 invert"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-base font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  {selectedOption.drivers && (
                    <p className="mt-0.5 text-xs text-[#b0b0b0]">{selectedOption.drivers}</p>
                  )}
                  {selectedOption.description && (
                    <p className="mt-2 max-w-xs text-center text-xs text-neutral-400">
                      {selectedOption.description}
                    </p>
                  )}
                </div>
              ) : selectedOption.emoji ? (
                <div className="flex flex-col items-center">
                  <div className="flex h-36 w-36 items-center justify-center text-8xl">
                    {selectedOption.emoji}
                  </div>
                  <p className="mt-2 text-base font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  {selectedOption.subtitle && (
                    <p className="mt-0.5 text-xs text-[#b0b0b0]">{selectedOption.subtitle}</p>
                  )}
                </div>
              ) : selectedOption.character ? (
                <div className="flex flex-col items-center">
                  <div className="h-40 w-20">
                    <PixelCharacter characterId={selectedOption.id} className="h-full w-full" />
                  </div>
                  <p className="mt-2 text-base font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  <p className="mt-1 max-w-xs text-center text-xs text-neutral-400">
                    {selectedOption.description}
                  </p>
                </div>
              ) : (
                /* Circuit / celebration with image */
                <div className="flex flex-col items-center">
                  <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-sm">
                    <Image
                      src={selectedOption.image!}
                      alt={selectedOption.label}
                      fill
                      unoptimized
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 border border-neutral-700" />
                  </div>
                  <p className="mt-3 text-base font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  {selectedOption.subtitle && (
                    <p className="mt-0.5 text-xs text-[#b0b0b0]">{selectedOption.subtitle}</p>
                  )}
                  {selectedOption.description && (
                    <p className="mt-1.5 max-w-xs text-center text-xs text-neutral-400">
                      {selectedOption.description}
                    </p>
                  )}
                </div>
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
              Move the slider to choose
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Slider selector — fixed at bottom */}
      <div className="relative z-10 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <SliderSelector
            options={options}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
            onIndexChange={handleIndexChange}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-4 pb-5 pt-1">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-neutral-800 text-xs font-bold text-white">
              B
            </span>
            Back
          </button>

          <AnimatePresence>
            {selectedId && (
              <motion.button
                onClick={onNext}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                Next
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#E10600] text-xs font-bold text-white">
                  A
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

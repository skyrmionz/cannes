"use client";

import { useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { LogoHeader } from "./logo-header";

export interface QuestionOption {
  id: string;
  label: string;
  description: string;
  image?: string;
}

export interface PreviewConfig {
  type: "driver" | "style" | "circuit";
  /** For drivers: map of id -> car image path */
  carImages?: Record<string, string>;
  /** For circuits: map of id -> race photo path */
  racePhotos?: Record<string, string>;
}

interface QuestionScreenProps {
  title: string;
  options: QuestionOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  preview?: PreviewConfig;
}

export function QuestionScreen({
  title,
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
  preview,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  const hasImages = options.some((o) => o.image);
  const selectedOption = options.find((o) => o.id === selectedId);

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

      {/* Preview / confirmation area */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {selectedOption && preview && (
            <motion.div
              key={selectedId}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {preview.type === "driver" && (
                <div className="flex items-end gap-6 md:gap-10">
                  {/* Driver headshot */}
                  <div className="relative h-52 w-40 md:h-72 md:w-56">
                    <Image
                      src={selectedOption.image || ""}
                      alt={selectedOption.label}
                      fill
                      className="object-contain object-bottom"
                    />
                  </div>
                  {/* Team car */}
                  {preview.carImages?.[selectedId!] && (
                    <div className="relative h-28 w-52 md:h-36 md:w-72">
                      <Image
                        src={preview.carImages[selectedId!]}
                        alt={`${selectedOption.label}'s car`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {preview.type === "style" && (
                <div className="flex flex-col items-center">
                  {/* Visual representation of driving style */}
                  <div className="relative flex h-48 w-80 items-center justify-center md:h-64 md:w-[28rem]">
                    <StyleVisual styleId={selectedId!} />
                  </div>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                  <p className="mt-1 text-xs text-[#b0b0b0]">
                    {selectedOption.description}
                  </p>
                </div>
              )}

              {preview.type === "circuit" && (
                <div className="flex flex-col items-center">
                  {/* Circuit race photo */}
                  {preview.racePhotos?.[selectedId!] ? (
                    <div className="relative h-40 w-72 overflow-hidden rounded-sm md:h-52 md:w-96">
                      <Image
                        src={preview.racePhotos[selectedId!]}
                        alt={selectedOption.label}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 border border-neutral-700" />
                    </div>
                  ) : (
                    /* Fallback: show the circuit diagram larger */
                    <div className="relative h-40 w-64 md:h-48 md:w-80">
                      <Image
                        src={selectedOption.image || ""}
                        alt={selectedOption.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-white">
                    {selectedOption.label}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder when nothing is selected */}
        {!selectedOption && (
          <motion.p
            className="text-sm uppercase tracking-wider text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Select an option below
          </motion.p>
        )}
      </div>

      {/* Bottom section: horizontal card row + buttons */}
      <div className="relative z-10 px-4 pb-8 md:px-8 md:pb-12">
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
                "group flex-shrink-0 overflow-hidden rounded-sm border text-left transition-colors",
                hasImages ? "w-48 md:w-56" : "w-48 md:w-56",
                selectedId === option.id
                  ? "border-[#E10600] bg-[#1a1a1a] shadow-[0_0_24px_rgba(225,6,0,0.3)]"
                  : "border-neutral-800 bg-[#111] hover:border-neutral-500 hover:bg-[#1a1a1a]"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.45 }}
            >
              {/* Red accent line at top of selected card */}
              <div
                className={cn(
                  "h-[2px] w-full transition-colors",
                  selectedId === option.id
                    ? "bg-[#E10600]"
                    : "bg-transparent group-hover:bg-neutral-700"
                )}
              />

              {option.image && (
                <div className="relative h-24 w-full bg-[#0a0a0a] md:h-32">
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className={
                      option.image.includes("drivers")
                        ? "object-contain object-bottom"
                        : "object-contain p-2"
                    }
                  />
                </div>
              )}

              <div className="p-3 md:p-4">
                <div className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-white md:text-sm">
                  {option.label}
                </div>
                <div className="mt-0.5 text-[10px] text-[#b0b0b0] md:text-xs">
                  {option.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Navigation buttons */}
        <motion.div
          className="mx-auto mt-6 flex max-w-5xl items-center justify-end gap-3"
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
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#E10600] text-xs leading-none font-bold text-white">
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
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-xs leading-none font-bold text-white">
              B
            </span>
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/** Visual representation of driving styles using animated SVG graphics */
function StyleVisual({ styleId }: { styleId: string }) {
  switch (styleId) {
    case "oversteer":
      return (
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 200 100" className="h-36 w-64 md:h-48 md:w-80">
            {/* Sharp zigzag line representing precision */}
            <motion.polyline
              points="10,80 50,20 90,80 130,20 170,80 190,30"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.polyline
              points="10,80 50,20 90,80 130,20 170,80 190,30"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              style={{ filter: "blur(4px)" }}
            />
          </svg>
        </div>
      );
    case "understeer":
      return (
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 200 100" className="h-36 w-64 md:h-48 md:w-80">
            {/* Smooth wave representing stability */}
            <motion.path
              d="M10,50 C40,20 60,20 90,50 C120,80 140,80 170,50 C185,35 195,40 195,50"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M10,50 C40,20 60,20 90,50 C120,80 140,80 170,50 C185,35 195,40 195,50"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
              style={{ filter: "blur(4px)" }}
            />
          </svg>
        </div>
      );
    case "aggressive":
      return (
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 200 100" className="h-36 w-64 md:h-48 md:w-80">
            {/* Aggressive spike pattern */}
            <motion.polyline
              points="10,50 30,15 45,70 60,10 80,85 100,5 120,90 140,15 160,75 180,20 195,50"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.polyline
              points="10,50 30,15 45,70 60,10 80,85 100,5 120,90 140,15 160,75 180,20 195,50"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              style={{ filter: "blur(6px)" }}
            />
          </svg>
        </div>
      );
    case "smooth":
      return (
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 200 100" className="h-36 w-64 md:h-48 md:w-80">
            {/* Minimal gentle curve */}
            <motion.path
              d="M10,60 C60,55 80,45 100,45 C120,45 140,42 190,40"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M10,60 C60,55 80,45 100,45 C120,45 140,42 190,40"
              fill="none"
              stroke="#E10600"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
              style={{ filter: "blur(4px)" }}
            />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

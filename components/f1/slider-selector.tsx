"use client";

import { motion } from "motion/react";

interface SliderOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface SliderSelectorProps {
  options: SliderOption[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function SliderSelector({
  options,
  selectedIndex,
  onIndexChange,
}: SliderSelectorProps) {
  const count = options.length;

  return (
    <div className="w-full px-4">
      {/* Visible label strip — selected + one neighbour each side */}
      <div className="relative flex items-end justify-center gap-2 overflow-hidden">
        {[-2, -1, 0, 1, 2].map((offset) => {
          const i = selectedIndex + offset;
          if (i < 0 || i >= count) {
            return <div key={offset} className="w-20 flex-shrink-0" />;
          }
          const isSelected = offset === 0;
          const isNear = Math.abs(offset) === 1;
          return (
            <button
              key={options[i].id}
              onClick={() => onIndexChange(i)}
              className={`flex-shrink-0 truncate rounded-sm px-2 py-2 text-center transition-all duration-200 ${
                isSelected
                  ? "w-36 bg-white text-black"
                  : isNear
                  ? "w-24 bg-neutral-900 text-neutral-500"
                  : "w-16 bg-neutral-950 text-neutral-700"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="slider-bar"
                  className="mx-auto mb-1 h-[3px] w-8 rounded-full bg-[#E10600]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <p
                className={`truncate text-center font-bold uppercase leading-tight tracking-wide ${
                  isSelected ? "text-[11px]" : "text-[9px]"
                }`}
              >
                {options[i].label}
              </p>
              {isSelected && options[i].subtitle && (
                <p className="mt-0.5 truncate text-[9px] text-neutral-500">
                  {options[i].subtitle}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Position pip track — one pip per option, active pip stretches */}
      <div className="mt-2.5 flex items-center justify-center gap-[3px] px-6">
        {options.map((_, i) => (
          <button
            key={i}
            onClick={() => onIndexChange(i)}
            className={`rounded-full transition-all duration-200 ${
              i === selectedIndex
                ? "h-1.5 bg-[#E10600]"
                : "h-1.5 bg-neutral-800 hover:bg-neutral-600"
            }`}
            style={{
              width: i === selectedIndex ? `${Math.max(16, 240 / count)}px` : "6px",
            }}
            aria-label={options[i].label}
          />
        ))}
      </div>

      {/* Position counter */}
      <p className="mt-1.5 text-center text-[10px] uppercase tracking-widest text-neutral-600">
        {selectedIndex + 1} / {count}
      </p>
    </div>
  );
}

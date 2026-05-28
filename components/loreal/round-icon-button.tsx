"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: ReactNode;
  size?: number;
  variant?: "blue" | "glass";
}

// Round button with two variants:
//   - "blue" (default): solid blue → matches the primary Next button.
//   - "glass": inverted, frosted-white with dark icon → reads as a quieter
//     control, used for +/− around the droplet so they don't compete with
//     the bottom-right Next button.
export function RoundIconButton({
  onClick,
  disabled = false,
  ariaLabel,
  children,
  size = 56,
  variant = "blue",
}: Props) {
  const isGlass = variant === "glass";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`grid place-items-center rounded-full disabled:opacity-40 ${
        isGlass ? "text-[#001050]" : "text-white"
      }`}
      style={{
        width: size,
        height: size,
        background: isGlass
          ? "rgba(255,255,255,0.55)"
          : "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)",
        boxShadow: isGlass
          ? [
              "0 0 0 1px rgba(255,255,255,0.7) inset",
              "0 1px 0 rgba(255,255,255,0.85) inset",
              "0 8px 18px rgba(120,160,220,0.25)",
            ].join(", ")
          : [
              "0 1px 0 rgba(255,255,255,0.45) inset",
              "0 -1px 0 rgba(0,16,80,0.25) inset",
              "0 0 0 1px rgba(255,255,255,0.25) inset",
              "0 10px 22px rgba(15,84,200,0.4)",
            ].join(", "),
        WebkitBackdropFilter: isGlass ? "blur(10px) saturate(140%)" : undefined,
        backdropFilter: isGlass ? "blur(10px) saturate(140%)" : undefined,
      }}
    >
      {children}
    </motion.button>
  );
}

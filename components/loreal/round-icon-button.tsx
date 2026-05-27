"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: ReactNode;
  size?: number;
}

// Round glassy button matching the style of the screen's primary Next button,
// shrunk down for inline +/− interactions next to the droplet.
export function RoundIconButton({
  onClick,
  disabled = false,
  ariaLabel,
  children,
  size = 56,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className="grid place-items-center rounded-full text-white disabled:opacity-40"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)",
        boxShadow: [
          "0 1px 0 rgba(255,255,255,0.45) inset",
          "0 -1px 0 rgba(0,16,80,0.25) inset",
          "0 0 0 1px rgba(255,255,255,0.25) inset",
          "0 10px 22px rgba(15,84,200,0.4)",
        ].join(", "),
      }}
    >
      {children}
    </motion.button>
  );
}

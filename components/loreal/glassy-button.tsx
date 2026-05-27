"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface Props {
  onClick: () => void;
  children: ReactNode;
  delay?: number;
}

// L'Oreal CTA button — wipe-shimmer effect ported from
// buttons.cool/button/BaeZJqd (simeydotme), recolored to our blue palette.
//
// Visual breakdown:
//   - blue diagonal gradient base (315° from light blue → brand → deep navy)
//   - .glassy-shimmer overlay with outer multi-layer glow + inner edge highlight,
//     masked into a wipe that sweeps 200% → 0% on a 1.5s linear loop
//   - text gets a single-shot gradient sweep on hover via background-clip: text
//   - scale-up 1.06 on hover, 1.02 on press, springy ease
//
// Styles live in app/globals.css under `.glassy-cta`.
export function GlassyButton({ onClick, children, delay = 1.4 }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glassy-cta pointer-events-auto relative overflow-visible rounded-full px-14 py-4 text-base font-semibold tracking-tight"
    >
      <span aria-hidden className="glassy-shimmer" />
      <span className="glassy-cta-text">{children}</span>
    </motion.button>
  );
}

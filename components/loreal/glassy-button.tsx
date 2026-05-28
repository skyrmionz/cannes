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
      className="glassy-cta pointer-events-auto relative overflow-visible rounded-full font-semibold tracking-tight"
      style={{
        // Padding + font scale gracefully on short viewports so the bigger
        // desktop look doesn't blow out at 360h or push the button outside
        // the glass card.
        paddingInline: "clamp(2.4rem, 6vw, 4rem)",
        paddingBlock: "clamp(0.85rem, 2vh, 1.5rem)",
        fontSize: "clamp(1rem, min(3.6vw, 2.6vh), 1.25rem)",
      }}
    >
      <span aria-hidden className="glassy-shimmer" />
      <span className="glassy-cta-text">{children}</span>
    </motion.button>
  );
}

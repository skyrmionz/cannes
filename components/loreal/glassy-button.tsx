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
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Glow ring — lives behind the button as a sibling */}
      <span aria-hidden className="glassy-shimmer" />
      <button
        type="button"
        onClick={onClick}
        className="glassy-cta pointer-events-auto relative rounded-full font-semibold tracking-tight"
        style={{
          paddingInline: "clamp(3rem, 9vw, 5.5rem)",
          paddingBlock: "clamp(1.15rem, 2.8vh, 2rem)",
          fontSize: "clamp(1.4rem, min(5.2vw, 3.6vh), 1.85rem)",
        }}
      >
        <span className="glassy-cta-text">{children}</span>
      </button>
    </motion.div>
  );
}

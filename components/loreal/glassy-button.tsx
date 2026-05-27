"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface Props {
  onClick: () => void;
  children: ReactNode;
  delay?: number;
}

// L'Oreal CTA button — keeps the blue gradient palette but adopts the
// Logan Liffick (codepen.io/loganliffick/pen/WNdZQZQ) interaction language:
//   - continuous shimmer (background-position pulses on a 1.5s alternate loop)
//   - asymmetric dual-color glow (light blue top-left, deep navy bottom-right)
//   - SVG light blob that translates + scales across on hover
//   - tilt -3° on hover, scale 0.95 + tilt -3° on active
//
// Styles live in app/globals.css under `.glassy-cta` because Tailwind v4 +
// keyframes inside a component need a global stylesheet.
export function GlassyButton({ onClick, children, delay = 1.4 }: Props) {
  return (
    <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glassy-cta pointer-events-auto relative isolate overflow-hidden rounded-full border-0 px-14 py-4 text-base font-semibold tracking-tight text-white"
      >
        {/* Sheen SVG that translates across on hover — direct port from the
            Logan Liffick pen, recolored to white-tinted blue to match our palette. */}
        <svg
          className="sheen"
          width="79"
          height="46"
          viewBox="0 0 79 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <g filter="url(#glassyCtaBlur)">
            <path d="M42.9 2H76.5L34.5 44H2L42.9 2Z" fill="url(#glassyCtaGrad)" />
          </g>
          <defs>
            <filter
              id="glassyCtaBlur"
              x="0"
              y="0"
              width="78.5"
              height="46"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur" />
            </filter>
            <linearGradient
              id="glassyCtaGrad"
              x1="76.5"
              y1="2"
              x2="34.5"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" stopOpacity="0.6" />
              <stop offset="1" stopColor="white" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,16,80,0.45)]">
        {children}
      </span>
    </motion.button>
  );
}

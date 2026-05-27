"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 2500;

// 4 horizontal strips of repeating 3D icons, each row alternating direction.
// Centered headline "You're glowing!" sits on its own band so the carousels
// never overlap the words.
export function LorealVibingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, HOLD_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Top two rows */}
      <div className="flex min-h-0 flex-1 flex-col justify-around pt-4">
        <PoppingRow delay={0.05}>
          <CarouselRow src="/loreal/persona-sunglasses.png" direction="left" speed={20} />
        </PoppingRow>
        <PoppingRow delay={0.18}>
          <CarouselRow src="/loreal/persona-watermelon.png" direction="right" speed={24} />
        </PoppingRow>
      </div>

      {/* Headline band — own row in the flex column, never overlapped */}
      <div className="flex shrink-0 items-center justify-center px-6 py-4">
        <motion.h1
          className="text-center font-bold leading-[0.95] tracking-tight text-[#001050]"
          style={{
            fontSize: "clamp(3rem, 13vw, 5rem)",
            textShadow: "0 4px 24px rgba(255,255,255,0.6)",
          }}
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{
            opacity: 1,
            scale: [0.7, 1.08, 1],
            y: [16, -6, 4, -3, 0],
          }}
          transition={{
            opacity: { duration: 0.45, ease: "easeOut", delay: 0.3 },
            scale: {
              duration: 0.55,
              times: [0, 0.65, 1],
              ease: [0.34, 1.56, 0.64, 1], // overshoot/back-out for the pop
              delay: 0.3,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0.85,
            },
          }}
        >
          You&apos;re glowing!
        </motion.h1>
      </div>

      {/* Bottom two rows */}
      <div className="flex min-h-0 flex-1 flex-col justify-around pb-4">
        <PoppingRow delay={0.42}>
          <CarouselRow src="/loreal/persona-dewy.png" direction="left" speed={22} />
        </PoppingRow>
        <PoppingRow delay={0.54}>
          <CarouselRow src="/loreal/persona-palm-sun.png" direction="right" speed={26} />
        </PoppingRow>
      </div>
    </div>
  );
}

// Stagger-in wrapper that pops each carousel row in with a slight overshoot
// scale + fade. The infinite horizontal scroll inside is unaffected.
function PoppingRow({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.55,
        ease: [0.34, 1.56, 0.64, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function CarouselRow({
  src,
  direction,
  speed,
}: {
  src: string;
  direction: "left" | "right";
  speed: number;
}) {
  const COUNT = 8;
  const ICON = 96;
  const GAP = 56;
  const STRIDE = ICON + GAP;
  const TRAVEL = COUNT * STRIDE;

  return (
    // overflow-x-clip lets the strip scroll horizontally without revealing
    // off-screen copies, while leaving the vertical axis free so the bob
    // animation isn't cut off at the row edges.
    <div className="relative h-[120px] overflow-x-clip">
      <motion.div
        className="absolute top-1/2 left-0 flex -translate-y-1/2 items-center"
        style={{ gap: `${GAP}px` }}
        animate={{
          x: direction === "left" ? [0, -TRAVEL] : [-TRAVEL, 0],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {Array.from({ length: COUNT * 2 }).map((_, i) => (
          <FloatingIcon
            key={i}
            src={src}
            size={ICON}
            bobDelay={(i % COUNT) * 0.25}
          />
        ))}
      </motion.div>
    </div>
  );
}

function FloatingIcon({
  src,
  size,
  bobDelay,
}: {
  src: string;
  size: number;
  bobDelay: number;
}) {
  return (
    <motion.div
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0, 6, 0] }}
      transition={{
        duration: 3.2,
        ease: "easeInOut",
        repeat: Infinity,
        delay: bobDelay,
      }}
    >
      <Image
        src={src}
        alt=""
        width={size * 2}
        height={size * 2}
        className="h-full w-full select-none object-contain"
        unoptimized
      />
    </motion.div>
  );
}

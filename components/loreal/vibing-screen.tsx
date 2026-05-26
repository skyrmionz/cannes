"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 2500;

// 4 horizontal strips of repeating 3D icons, each row alternating direction.
// Centered headline "You're glowing!" sits on top.
export function LorealVibingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, HOLD_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Carousel rows — fill the column with even vertical distribution */}
      <div className="absolute inset-0 flex flex-col justify-around py-12">
        <CarouselRow src="/loreal/persona-sunglasses.png" direction="left" speed={20} />
        <CarouselRow src="/loreal/persona-watermelon.png" direction="right" speed={24} />
        <CarouselRow src="/loreal/persona-dewy.png" direction="left" speed={22} />
        <CarouselRow src="/loreal/persona-palm-sun.png" direction="right" speed={26} />
      </div>

      {/* Centered headline */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1
          className="text-center font-bold leading-[0.95] tracking-tight text-[#001050]"
          style={{
            fontSize: "clamp(3.25rem, 14vw, 5.25rem)",
            textShadow: "0 4px 24px rgba(255,255,255,0.6)",
          }}
        >
          You&apos;re glowing!
        </h1>
      </motion.div>
    </div>
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
  // Render 8 copies; animate the strip by exactly one icon-cycle width so the
  // wrap is invisible.
  const COUNT = 8;
  const ICON = 96; // visual icon size in px
  const GAP = 56;
  const STRIDE = ICON + GAP;
  const TRAVEL = COUNT * STRIDE;

  return (
    <div className="relative h-[120px] overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 flex items-center"
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
        {/* 2x duplicate count so the strip can scroll TRAVEL pixels and still
            look full at the wrap point. */}
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

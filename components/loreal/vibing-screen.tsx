"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 5000;
const EXIT_DURATION = 0.45;

// Number of icons in each orbital ring
const SUN_COUNT = 8;
const WATER_COUNT = 10;
const TREE_COUNT = 12;

export function LorealVibingScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"enter" | "spin" | "exit">("enter");

  useEffect(() => {
    // enter → spin after the pop-in finishes
    const t1 = setTimeout(() => setPhase("spin"), 600);
    // spin → exit before transitioning out
    const t2 = setTimeout(() => setPhase("exit"), HOLD_MS - EXIT_DURATION * 1000 - 200);
    const t3 = setTimeout(onComplete, HOLD_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const isVisible = phase === "enter" || phase === "spin";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Agent Astro — center, pops in then out */}
      <motion.div
        className="absolute z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
          duration: EXIT_DURATION,
        }}
      >
        <Image
          src="/loreal/agent-astro.png"
          alt="Agent Astro"
          width={720}
          height={720}
          priority
          className="h-auto select-none"
          style={{ width: "min(36vw, 22vh)" }}
        />
      </motion.div>

      {/* Sun ring — innermost, clockwise */}
      <OrbitalRing
        src="/loreal/icon-sun.png"
        count={SUN_COUNT}
        radius="min(26vw, 18vh)"
        iconSize="min(11vw, 7vh)"
        direction={1}
        speed={18}
        isVisible={isVisible}
        delay={0.08}
      />

      {/* Water ring — middle, counter-clockwise */}
      <OrbitalRing
        src="/loreal/icon-water.png"
        count={WATER_COUNT}
        radius="min(42vw, 30vh)"
        iconSize="min(13vw, 9vh)"
        direction={-1}
        speed={24}
        isVisible={isVisible}
        delay={0.16}
      />

      {/* Tree ring — outermost, clockwise */}
      <OrbitalRing
        src="/loreal/icon-tree.png"
        count={TREE_COUNT}
        radius="min(60vw, 42vh)"
        iconSize="min(16vw, 11vh)"
        direction={1}
        speed={30}
        isVisible={isVisible}
        delay={0.24}
      />
    </div>
  );
}

function OrbitalRing({
  src,
  count,
  radius,
  iconSize,
  direction,
  speed,
  isVisible,
  delay,
}: {
  src: string;
  count: number;
  radius: string;
  iconSize: string;
  direction: 1 | -1;
  speed: number;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: `calc(${radius} * 2)`,
        height: `calc(${radius} * 2)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0,
        rotate: isVisible ? direction * 360 : 0,
      }}
      transition={{
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 22,
          delay: isVisible ? delay : 0,
        },
        opacity: {
          duration: 0.3,
          delay: isVisible ? delay : 0,
        },
        rotate: {
          duration: speed,
          ease: "linear",
          repeat: Infinity,
          delay: isVisible ? delay + 0.4 : 0,
        },
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `rotate(${angle}deg) translateY(-${radius}) rotate(-${angle}deg)`,
              marginLeft: `calc(-${iconSize} / 2)`,
              marginTop: `calc(-${iconSize} / 2)`,
              width: iconSize,
              height: iconSize,
            }}
          >
            <Image
              src={src}
              alt=""
              width={200}
              height={200}
              className="h-full w-full select-none object-contain"
              unoptimized
            />
          </div>
        );
      })}
    </motion.div>
  );
}

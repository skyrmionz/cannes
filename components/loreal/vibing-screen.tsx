"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 5000;

// Matching the reference: fewer, larger icons. Astro dominates the center.
const SUN_COUNT = 8;
const WATER_COUNT = 6;
const TREE_COUNT = 4;

export function LorealVibingScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"enter" | "spin" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spin"), 900);
    const t2 = setTimeout(() => setPhase("exit"), HOLD_MS - 700);
    const t3 = setTimeout(onComplete, HOLD_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const isVisible = phase !== "exit";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Agent Astro — center, pops in/out */}
      <motion.div
        className="absolute z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          phase === "exit"
            ? { scale: 0, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={
          phase === "exit"
            ? { duration: 0.5, ease: [0.6, 0, 0.7, 0.2] }
            : { type: "spring", stiffness: 450, damping: 20, delay: 0.05 }
        }
      >
        <Image
          src="/loreal/agent-astro.png"
          alt="Agent Astro"
          width={720}
          height={720}
          priority
          className="h-auto select-none"
          style={{ width: "min(44vw, 28vh)" }}
        />
      </motion.div>

      {/* Sun ring — innermost, clockwise, small icons */}
      <OrbitalRing
        src="/loreal/icon-sun.png"
        count={SUN_COUNT}
        radius="min(30vw, 20vh)"
        iconSize="min(10vw, 7vh)"
        direction={1}
        speed={20}
        phase={phase}
        delay={0.1}
        spiralRotation={180}
      />

      {/* Water ring — middle, counter-clockwise, medium icons */}
      <OrbitalRing
        src="/loreal/icon-water.png"
        count={WATER_COUNT}
        radius="min(50vw, 34vh)"
        iconSize="min(16vw, 11vh)"
        direction={-1}
        speed={28}
        phase={phase}
        delay={0.2}
        spiralRotation={-240}
      />

      {/* Tree ring — outermost, clockwise, large icons */}
      <OrbitalRing
        src="/loreal/icon-tree.png"
        count={TREE_COUNT}
        radius="min(72vw, 48vh)"
        iconSize="min(24vw, 16vh)"
        direction={1}
        speed={36}
        phase={phase}
        delay={0.3}
        spiralRotation={300}
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
  phase,
  delay,
  spiralRotation,
}: {
  src: string;
  count: number;
  radius: string;
  iconSize: string;
  direction: 1 | -1;
  speed: number;
  phase: "enter" | "spin" | "exit";
  delay: number;
  spiralRotation: number;
}) {
  // During enter: scale from 0 + rotate spiralRotation° to scale 1 + rotate 0.
  // During spin: rotate continuously.
  // During exit: scale back to 0 + rotate -spiralRotation° (reverse spiral).
  const getAnimate = () => {
    if (phase === "exit") {
      return { scale: 0, opacity: 0, rotate: -spiralRotation };
    }
    // enter + spin: full scale, continuous rotation
    return {
      scale: 1,
      opacity: 1,
      rotate: direction * 360,
    };
  };

  const getTransition = () => {
    if (phase === "exit") {
      return {
        scale: { duration: 0.55, ease: [0.6, 0, 0.7, 0.2] },
        opacity: { duration: 0.4 },
        rotate: { duration: 0.55, ease: [0.6, 0, 0.7, 0.2] },
      };
    }
    return {
      scale: {
        type: "spring" as const,
        stiffness: 300,
        damping: 18,
        delay,
      },
      opacity: {
        duration: 0.3,
        delay,
      },
      rotate: {
        duration: speed,
        ease: "linear" as const,
        repeat: Infinity,
        delay: delay + 0.6,
      },
    };
  };

  return (
    <motion.div
      className="absolute"
      style={{
        width: `calc(${radius} * 2)`,
        height: `calc(${radius} * 2)`,
      }}
      initial={{ scale: 0, opacity: 0, rotate: spiralRotation }}
      animate={getAnimate()}
      transition={getTransition()}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * 50;
        const y = 50 - Math.cos(rad) * 50;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: iconSize,
              height: iconSize,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Counter-rotate so icons stay upright while the ring spins */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={
                phase === "exit"
                  ? { rotate: 0 }
                  : { rotate: -direction * 360 }
              }
              transition={
                phase === "exit"
                  ? { duration: 0.55 }
                  : {
                      duration: speed,
                      ease: "linear",
                      repeat: Infinity,
                      delay: delay + 0.6,
                    }
              }
              className="h-full w-full"
            >
              <Image
                src={src}
                alt=""
                width={200}
                height={200}
                className="h-full w-full select-none object-contain"
                unoptimized
              />
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

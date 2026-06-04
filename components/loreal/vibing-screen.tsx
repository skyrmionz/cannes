"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 5000;
// Small delay so the cross-zoom from the intro has compositing headroom
// before the 30+ orbital children start tweening, but short enough that the
// loading screen doesn't feel empty.
const ANIM_START_DELAY_MS = 120;

const SUN_COUNT = 10;
const WATER_COUNT = 10;
const TREE_COUNT = 10;

export function LorealVibingScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<
    "pre" | "spiral-in" | "spin" | "spiral-out"
  >("pre");

  useEffect(() => {
    // Use requestAnimationFrame to flip into spiral-in immediately after the
    // first paint — the very small delay (~16ms) is enough to avoid layout
    // collision with the outgoing intro, but doesn't leave the screen empty.
    let raf = 0;
    const t0 = setTimeout(() => {
      raf = requestAnimationFrame(() => setPhase("spiral-in"));
    }, ANIM_START_DELAY_MS);
    const t1 = setTimeout(() => setPhase("spin"), ANIM_START_DELAY_MS + 1000);
    const t2 = setTimeout(() => setPhase("spiral-out"), HOLD_MS - 800);
    const t3 = setTimeout(onComplete, HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Agent Astro — center */}
      <motion.div
        className="absolute z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          phase === "spiral-out"
            ? { scale: 0, opacity: 0 }
            : phase === "pre"
              ? { scale: 0, opacity: 0 }
              : { scale: 1, opacity: 1 }
        }
        transition={
          phase === "spiral-out"
            ? { duration: 0.6, ease: [0.4, 0, 0.7, 0.2] as [number, number, number, number] }
            : { type: "spring", stiffness: 450, damping: 20, delay: 0.05 }
        }
      >
        <Image
          src="/loreal/agent-astro.png"
          alt="Agent Astro"
          width={2981}
          height={2756}
          priority
          unoptimized
          className="h-auto select-none"
          style={{ width: "min(32vw, 20vh)" }}
        />
      </motion.div>

      {/* Sun ring — innermost, clockwise */}
      <OrbitalRing
        src="/loreal/icon-sun.png"
        count={SUN_COUNT}
        radius="min(24vw, 16vh)"
        iconSize="min(12vw, 8vh)"
        direction={1}
        speed={10}
        phase={phase}
        delay={0.05}
        spiralTurns={0.6}
        iconRotation="none"
      />

      {/* Beach chair ring — middle, counter-clockwise */}
      <OrbitalRing
        src="/loreal/icon-beach-chair.png"
        count={WATER_COUNT}
        radius="min(40vw, 28vh)"
        iconSize="min(18vw, 12vh)"
        direction={-1}
        speed={14}
        phase={phase}
        delay={0.12}
        spiralTurns={0.8}
        iconRotation="none"
      />

      {/* Tree ring — outermost, clockwise, trunks face inward */}
      <OrbitalRing
        src="/loreal/icon-tree.png"
        count={TREE_COUNT}
        radius="min(60vw, 42vh)"
        iconSize="min(26vw, 18vh)"
        direction={1}
        speed={18}
        phase={phase}
        delay={0.2}
        spiralTurns={1}
        iconRotation="inward"
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
  spiralTurns,
  iconRotation,
}: {
  src: string;
  count: number;
  radius: string;
  iconSize: string;
  direction: 1 | -1;
  speed: number;
  phase: "pre" | "spiral-in" | "spin" | "spiral-out";
  delay: number;
  spiralTurns: number;
  iconRotation: "outward" | "inward" | "none";
}) {
  const spiralDeg = spiralTurns * 360 * direction;

  // Use a counter that increments each spin cycle so the rotate target
  // always increases — Framer Motion transitions smoothly to the next value.
  const getAnimate = () => {
    if (phase === "spiral-out") {
      return { scale: 0, opacity: 0, rotate: 0 };
    }
    if (phase === "pre") {
      return { scale: 0, opacity: 0, rotate: 0 };
    }
    // Both spiral-in and spin use the same target — the continuous spin.
    // During spiral-in, the transition eases in; during spin, it's linear.
    return {
      scale: 1,
      opacity: 1,
      rotate: spiralDeg + direction * 3600,
    };
  };

  const getTransition = (): Record<string, object> => {
    if (phase === "spiral-out") {
      return {
        scale: {
          duration: 0.7,
          ease: [0.4, 0, 0.7, 0.1] as [number, number, number, number],
        },
        opacity: { duration: 0.6 },
        rotate: {
          duration: 0.7,
          ease: [0.4, 0, 0.7, 0.1] as [number, number, number, number],
        },
      };
    }
    // Spiral-in + spin: one continuous animation from scale 0 to full spin.
    // The large rotate target (3600°) at linear ease = continuous spinning.
    // Scale/opacity use an ease-out curve for the initial expansion.
    return {
      scale: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay,
      },
      opacity: { duration: 0.4, delay },
      rotate: {
        duration: speed * 10,
        ease: "linear",
        delay,
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
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={getAnimate()}
      transition={getTransition()}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * 50;
        const y = 50 - Math.cos(rad) * 50;

        // Fixed orientation relative to center:
        // "outward" = tip/bottom points away from center
        // "inward" = bottom faces center (trunk inward for trees)
        // "none" = no rotation (default upright)
        let iconAngle = 0;
        if (iconRotation === "outward") iconAngle = angle + 180;
        else if (iconRotation === "inward") iconAngle = angle;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: iconSize,
              height: iconSize,
              transform: `translate(-50%, -50%) rotate(${iconAngle}deg)`,
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

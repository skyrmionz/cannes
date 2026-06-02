"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 5000;

const SUN_COUNT = 8;
const WATER_COUNT = 6;
const TREE_COUNT = 8;

export function LorealVibingScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"spiral-in" | "spin" | "spiral-out">(
    "spiral-in",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spin"), 1000);
    const t2 = setTimeout(() => setPhase("spiral-out"), HOLD_MS - 800);
    const t3 = setTimeout(onComplete, HOLD_MS);
    return () => {
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
          width={720}
          height={720}
          priority
          className="h-auto select-none"
          style={{ width: "min(32vw, 20vh)" }}
        />
      </motion.div>

      {/* Sun ring — innermost, clockwise */}
      <OrbitalRing
        src="/loreal/icon-sun.png"
        count={SUN_COUNT}
        radius="min(28vw, 19vh)"
        iconSize="min(14vw, 9vh)"
        direction={1}
        speed={12}
        phase={phase}
        delay={0.05}
        spiralTurns={0.6}
        iconRotation="none"
      />

      {/* Water ring — middle, counter-clockwise, droplets face outward */}
      <OrbitalRing
        src="/loreal/icon-water.png"
        count={WATER_COUNT}
        radius="min(48vw, 33vh)"
        iconSize="min(20vw, 14vh)"
        direction={-1}
        speed={16}
        phase={phase}
        delay={0.12}
        spiralTurns={0.8}
        iconRotation="outward"
      />

      {/* Tree ring — outermost, clockwise, trunks face inward */}
      <OrbitalRing
        src="/loreal/icon-tree.png"
        count={TREE_COUNT}
        radius="min(72vw, 48vh)"
        iconSize="min(30vw, 20vh)"
        direction={1}
        speed={20}
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
  phase: "spiral-in" | "spin" | "spiral-out";
  delay: number;
  spiralTurns: number;
  iconRotation: "outward" | "inward" | "none";
}) {
  const spiralDeg = spiralTurns * 360 * direction;

  const getAnimate = () => {
    switch (phase) {
      case "spiral-in":
        // Spiral out from center: scale 0 → 1, rotate from 0 to spiralDeg
        return { scale: 1, opacity: 1, rotate: spiralDeg };
      case "spin":
        // Continuous rotation
        return { scale: 1, opacity: 1, rotate: spiralDeg + direction * 360 };
      case "spiral-out":
        // Spiral back in: scale 1 → 0, rotate back
        return { scale: 0, opacity: 0, rotate: 0 };
    }
  };

  const getTransition = (): Record<string, object> => {
    switch (phase) {
      case "spiral-in":
        return {
          scale: {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay,
          },
          opacity: { duration: 0.4, delay },
          rotate: {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay,
          },
        };
      case "spin":
        return {
          rotate: {
            duration: speed,
            ease: "linear",
            repeat: Infinity,
          },
          scale: { duration: 0.01 },
          opacity: { duration: 0.01 },
        };
      case "spiral-out":
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

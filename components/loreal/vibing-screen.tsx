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
      {/* Agent Astro — center */}
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
            ? { duration: 0.6, ease: [0.6, 0, 0.7, 0.2] }
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
        speed={20}
        phase={phase}
        delay={0.1}
        spiralRotation={180}
        iconRotation="outward"
      />

      {/* Water ring — middle, counter-clockwise, droplets face outward */}
      <OrbitalRing
        src="/loreal/icon-water.png"
        count={WATER_COUNT}
        radius="min(48vw, 33vh)"
        iconSize="min(20vw, 14vh)"
        direction={-1}
        speed={28}
        phase={phase}
        delay={0.2}
        spiralRotation={-240}
        iconRotation="outward"
      />

      {/* Tree ring — outermost, clockwise, trunks face inward */}
      <OrbitalRing
        src="/loreal/icon-tree.png"
        count={TREE_COUNT}
        radius="min(72vw, 48vh)"
        iconSize="min(30vw, 20vh)"
        direction={1}
        speed={36}
        phase={phase}
        delay={0.3}
        spiralRotation={300}
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
  spiralRotation,
  iconRotation,
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
  iconRotation: "outward" | "inward";
}) {
  const getAnimate = () => {
    if (phase === "exit") {
      return { scale: 0, opacity: 0, rotate: -spiralRotation };
    }
    return {
      scale: 1,
      opacity: 1,
      rotate: direction * 360,
    };
  };

  const getTransition = (): Record<string, object> => {
    if (phase === "exit") {
      return {
        scale: { duration: 0.6, ease: [0.4, 0, 0.7, 0.2] as [number, number, number, number] },
        opacity: { duration: 0.5 },
        rotate: { duration: 0.6, ease: [0.4, 0, 0.7, 0.2] as [number, number, number, number] },
      };
    }
    return {
      scale: {
        type: "spring",
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
        ease: "linear",
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

        // Icons don't spin on their own axis. They have a fixed rotation
        // so they point outward or inward relative to the center.
        // "outward" = bottom of icon faces away from center (angle + 180)
        // "inward" = bottom of icon faces toward center (angle)
        const iconAngle = iconRotation === "outward" ? angle + 180 : angle;

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

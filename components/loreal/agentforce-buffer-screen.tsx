"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface Props {
  onComplete: () => void;
}

const HOLD_MS = 7000;
const LOADING_TEXT_SWITCH_MS = 4200;
const ANIM_START_DELAY_MS = 120;

const SUN_COUNT = 8;
const WATER_COUNT = 8;
const TREE_COUNT = 8;

export function LorealAgentforceBufferScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<
    "pre" | "spiral-in" | "spin" | "spiral-out"
  >("pre");
  const [loadingText, setLoadingText] = useState(
    "Setting your protection level...",
  );

  useEffect(() => {
    let raf = 0;
    const t0 = setTimeout(() => {
      raf = requestAnimationFrame(() => setPhase("spiral-in"));
    }, ANIM_START_DELAY_MS);
    const t1 = setTimeout(() => setPhase("spin"), ANIM_START_DELAY_MS + 1000);
    const t2 = setTimeout(
      () => setLoadingText("Locking in your OOO status..."),
      LOADING_TEXT_SWITCH_MS,
    );
    const t3 = setTimeout(() => setPhase("spiral-out"), HOLD_MS - 800);
    const t4 = setTimeout(onComplete, HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-6 pt-16 pb-10 sm:pt-24">
      {/* Top spacer pushes the title cluster down toward the carousel */}
      <div className="min-h-0 flex-1" />

      {/* Title + subtitle — sized to match the Coucou intro screen */}
      <motion.h1
        className="shrink-0 text-center font-bold leading-[1.05] tracking-tight text-[#001050]"
        style={{ fontSize: "min(10vw, 6vh)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        Your Cannes status
        <br />
        is almost ready
      </motion.h1>
      <motion.p
        className="mt-4 max-w-2xl shrink-0 px-2 text-center leading-snug text-[#001050]/85"
        style={{
          fontSize: "min(5vw, 2.4vh)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
      >
        Agentforce is turning your style into a tailored status, just like
        Salesforce helps companies deliver personalized moments for customers
        everyday.
      </motion.p>

      {/* Orbital ring animation — fixed height so the loading caption can
          sit directly beneath it instead of pinning to the screen bottom. */}
      <div
        className="relative shrink-0 flex w-full items-center justify-center"
        style={{
          height: "min(80vw, 52vh)",
          marginTop: "clamp(1rem, 3vh, 2rem)",
        }}
      >
        {/* Center astro */}
        <motion.div
          className="absolute z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            phase === "spiral-out" || phase === "pre"
              ? { scale: 0, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={
            phase === "spiral-out"
              ? {
                  duration: 0.6,
                  ease: [0.4, 0, 0.7, 0.2] as [number, number, number, number],
                }
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
            style={{ width: "min(20vw, 14vh)" }}
          />
        </motion.div>

        <OrbitalRing
          src="/loreal/icon-sun.png"
          count={SUN_COUNT}
          radius="min(15vw, 10vh)"
          iconSize="min(7vw, 5vh)"
          direction={1}
          speed={10}
          phase={phase}
          delay={0.05}
          spiralTurns={0.6}
          iconRotation="none"
        />
        <OrbitalRing
          src="/loreal/icon-water-droplet.png"
          count={WATER_COUNT}
          radius="min(25vw, 17vh)"
          iconSize="min(11vw, 7.5vh)"
          direction={-1}
          speed={14}
          phase={phase}
          delay={0.12}
          spiralTurns={0.8}
          iconRotation="none"
        />
        <OrbitalRing
          src="/loreal/crab.png"
          count={TREE_COUNT}
          radius="min(36vw, 24vh)"
          iconSize="min(15vw, 10vh)"
          direction={1}
          speed={18}
          phase={phase}
          delay={0.2}
          spiralTurns={1}
          iconRotation="none"
        />
      </div>

      {/* Loading caption — sits directly under the carousel.
          Sized to match the start screen's "Protect your time" tagline. */}
      <div
        className="relative shrink-0 w-full text-center"
        style={{
          minHeight: "2em",
          marginTop: "clamp(0.5rem, 2vh, 1.25rem)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingText}
            className="font-semibold tracking-tight text-[#001050]/75"
            style={{ fontSize: "min(5vw, 2.6vh)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {loadingText}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Bottom spacer — balances the top spacer so the title/carousel/
          caption cluster sits centered vertically. */}
      <div className="min-h-0 flex-1" />
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

  const getAnimate = () => {
    if (phase === "spiral-out") {
      return { scale: 0, opacity: 0, rotate: 0 };
    }
    if (phase === "pre") {
      return { scale: 0, opacity: 0, rotate: 0 };
    }
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

"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect } from "react";
import { DotBg } from "./dot-bg";

interface TransitionScreenProps {
  driverName: string;
  onContinue: () => void;
}

function AwardsRing() {
  return (
    <motion.div
      className="pointer-events-none absolute z-0"
      style={{ left: "50%", top: "50%", x: "-50%", y: "-50%" }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, rotate: 360 }}
      transition={{
        opacity: { delay: 0.05, duration: 0.35 },
        scale: { delay: 0.05, duration: 0.35, type: "spring", stiffness: 300, damping: 20 },
        rotate: { duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" },
      }}
    >
      <Image
        src="/awards-circle.png"
        alt=""
        width={1079}
        height={1294}
        unoptimized
        priority
        style={{ width: "84.7vw", height: "auto", maxWidth: "84.7vw" }}
      />
    </motion.div>
  );
}

export function TransitionScreen({ driverName, onContinue }: TransitionScreenProps) {
  useEffect(() => {
    const t = setTimeout(onContinue, 4000);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      <DotBg />

      {/* Outer astros ring — single pre-composed image, spins counter-clockwise */}
      <motion.div
        className="pointer-events-none absolute z-0"
        style={{ left: "50%", top: "50%", x: "-50%", y: "-50%" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, rotate: -360 }}
        transition={{
          opacity: { delay: 0.05, duration: 0.35 },
          scale: { delay: 0.05, duration: 0.35, type: "spring", stiffness: 300, damping: 20 },
          rotate: { duration: 30, repeat: Infinity, ease: "linear", repeatType: "loop" },
        }}
      >
        <Image
          src="/f1/astro-headphones-circle.png"
          alt=""
          width={1865}
          height={1865}
          unoptimized
          priority
          style={{ width: "155vw", height: "155vw", maxWidth: "155vw" }}
        />
      </motion.div>

      {/* Awards ring */}
      <AwardsRing />

      {/* Center text */}
      <motion.div
        className="relative z-10 px-10 text-center"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 22 }}
        style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
      >
        <p className="font-bold leading-tight text-white" style={{ fontSize: "clamp(2.6rem, 7vw, 4.4rem)" }}>
          {driverName},<br />
          you sound<br />
          famous<br />
          already
        </p>
      </motion.div>

    </div>
  );
}

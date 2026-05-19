"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { DotBg } from "./dot-bg";

interface TransitionScreenProps {
  driverName: string;
  onContinue: () => void;
}

const TROPHIES = [
  { top: "10%", left: "8%",  delay: 0.0, size: "text-4xl" },
  { top: "15%", left: "75%", delay: 0.2, size: "text-3xl" },
  { top: "35%", left: "88%", delay: 0.4, size: "text-4xl" },
  { top: "60%", left: "5%",  delay: 0.1, size: "text-2xl" },
  { top: "70%", left: "80%", delay: 0.3, size: "text-3xl" },
  { top: "80%", left: "50%", delay: 0.5, size: "text-4xl" },
  { top: "25%", left: "40%", delay: 0.6, size: "text-2xl" },
  { top: "55%", left: "60%", delay: 0.15, size: "text-3xl" },
];

export function TransitionScreen({ driverName, onContinue }: TransitionScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <DotBg />

      {/* Floating trophy emojis */}
      {TROPHIES.map((t, i) => (
        <motion.span
          key={i}
          className={`pointer-events-none absolute select-none ${t.size}`}
          style={{ top: t.top, left: t.left }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.8, 0.8, 0], y: [20, 0, -30, -60] }}
          transition={{
            delay: t.delay,
            duration: 2.5,
            ease: "easeOut",
          }}
        >
          🏆
        </motion.span>
      ))}

      {/* Headphones */}
      <motion.div
        className="relative z-10 mb-6 text-7xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
      >
        🎧
      </motion.div>

      {/* Name line */}
      <motion.p
        className="relative z-10 text-center text-4xl font-bold uppercase tracking-tight text-white md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {driverName},
      </motion.p>

      {/* Famous line */}
      <motion.p
        className="relative z-10 mt-2 text-center text-3xl font-bold uppercase tracking-tight text-white/90 md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        you sound famous already.
      </motion.p>
    </div>
  );
}

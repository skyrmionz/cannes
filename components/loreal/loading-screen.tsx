"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">

        <motion.h2
          className="max-w-md text-center font-serif text-xl font-light tracking-wide text-neutral-800 md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          We&apos;re putting together your personal beauty kit now!
        </motion.h2>

        <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-200">
          <motion.div
            className="h-full rounded-full bg-[#C8A96E]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
    </div>
  );
}

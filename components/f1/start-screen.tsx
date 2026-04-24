"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer bg-black"
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Image
        src="/f1/start-bg.png"
        alt="F1 Salesforce Start Page"
        fill
        className="object-contain"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-sm bg-black/60 px-10 py-4 backdrop-blur-sm">
          <motion.p
            className="text-lg uppercase tracking-[0.3em] text-white"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Tap to start
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { DotBg } from "./dot-bg";

interface IntroScreenProps {
  onNext: () => void;
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <DotBg wave />

      {/* Title + subtitle + squiggle */}
      <div className="relative z-10 flex flex-col items-center px-10 pt-20">
        <motion.h1
          className="text-center font-bold text-white"
          style={{ fontSize: "clamp(4rem, 11vw, 8rem)", lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          I&apos;m Agent Astro
        </motion.h1>

        <motion.p
          className="mt-6 text-center text-white/90"
          style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)", lineHeight: 1.5, maxWidth: "80%" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          Think of me as your pit crew.{" "}
          I&apos;ll drive the data, you steer, and we&apos;ll create a personalized track.
        </motion.p>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Image
            src="/f1/wavy-line.png"
            alt=""
            width={365}
            height={24}
            unoptimized
            className="object-contain"
            style={{ width: "clamp(200px, 45vw, 380px)", height: "auto" }}
          />
        </motion.div>
      </div>

      {/* Astro — large, fills middle */}
      <motion.div
        className="relative z-10 flex flex-1 items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        <Image
          src="/f1/astro-headphones.png"
          alt="Agent Astro"
          width={882}
          height={882}
          unoptimized
          priority
          className="object-contain"
          style={{
            width: "min(86vw, 56vh)",
            height: "min(86vw, 56vh)",
            filter: "drop-shadow(0 24px 60px rgba(0,30,160,0.55))",
          }}
        />
      </motion.div>

      {/* CTA pinned to bottom */}
      <div className="relative z-10 flex flex-col items-center px-10 pb-16">
        <motion.button
          onClick={onNext}
          style={{ background: "none", border: "none", padding: 0 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Image
            src="/f1/Buttons/lets-go-pill.png"
            alt="Let's go"
            width={880}
            height={108}
            unoptimized
            className="object-contain"
            style={{ width: "min(600px, 78vw)", height: "auto" }}
          />
        </motion.button>
      </div>
    </div>
  );
}

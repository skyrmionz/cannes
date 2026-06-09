"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GlassyButton } from "./glassy-button";

interface StartScreenProps {
  onStart: () => void;
}

export function LorealStartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6"
      style={{
        paddingTop: "clamp(2rem, 6vh, 4rem)",
        paddingBottom: "clamp(1rem, 3vh, 2rem)",
      }}
    >
      {/* Tap-anywhere to advance */}
      <button
        type="button"
        aria-label="Start"
        onClick={onStart}
        className="absolute inset-0 z-30 cursor-default"
        style={{ background: "transparent" }}
      />

      {/* Umbrella */}
      <motion.div
        className="umbrella-sway pointer-events-none absolute z-20 select-none"
        style={{
          top: "calc(-1 * min(14vw, 9vh))",
          right: "calc(-1 * min(8vw, 5vh))",
          width: "min(105vw, 88vh)",
          transformOrigin: "100% 100%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loreal/umbrella.png"
          alt=""
          width={1060}
          height={956}
          draggable={false}
          className="h-auto w-full select-none"
        />
      </motion.div>

      {/* Spacer for umbrella */}
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: "min(38vw, 30vh)" }}
      />

      {/* Headline + image + tagline */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-[#001050]">
        <HeadlineWord text="Your" delay={0.7} fontSize="min(18vw, 10vh)" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
          className="relative"
          style={{
            width: "min(72vw, 38vh)",
            marginTop: "-0.5rem",
            marginBottom: "-0.5rem",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/spf-sand.png"
            alt="SPF"
            draggable={false}
            className="h-auto w-full select-none"
          />
          {/* Crab — in the sand divet between P and F, slightly tilted right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/crab.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              width: "9%",
              left: "62%",
              bottom: "22%",
              transform: "rotate(5deg)",
              transformOrigin: "center bottom",
            }}
          />
        </motion.div>
        <HeadlineWord
          text="Status Protection Formulator"
          delay={1.0}
          fontSize="min(7vw, 3.8vh)"
          marginTop="-0.75rem"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-2 text-center leading-snug tracking-tight text-[#001050]/75"
          style={{ fontSize: "min(3.4vw, 1.8vh)", fontWeight: 400 }}
        >
          Answer three questions;
          <br />
          walk away with your Cannes status vibe...
          <br />
          and the SPF to match.
        </motion.p>
      </div>

      {/* CTA */}
      <div
        className="relative z-10 shrink-0"
        style={{
          marginTop: "clamp(1rem, 3vh, 2rem)",
          marginBottom: "clamp(1rem, 3vh, 2rem)",
        }}
      >
        <GlassyButton onClick={onStart}>I&apos;m in</GlassyButton>
      </div>

      {/* Powered-by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55, duration: 0.5 }}
        className="relative z-10 mt-auto shrink-0 pb-5"
      >
        <Image
          src="/loreal/powered-by-astro.png"
          alt="Powered by Agentforce from Salesforce"
          width={1140}
          height={120}
          priority
          className="h-auto select-none"
          style={{ width: "min(82vw, 38vh)" }}
        />
      </motion.div>
    </div>
  );
}

function HeadlineWord({
  text,
  delay,
  fontSize = "min(26vw, 14vh)",
  marginTop,
}: {
  text: string;
  delay: number;
  fontSize?: string;
  marginTop?: string;
}) {
  return (
    <motion.span
      className="block whitespace-nowrap text-center font-bold leading-[0.95] tracking-tight"
      style={{ fontSize, marginTop }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}

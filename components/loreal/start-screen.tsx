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

      {/* Headline + image + tagline — "Your" and "Status Protection
          Formulator" are absolutely positioned inside the SPF image's
          whitespace so they visually merge with the image. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-[#001050]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          className="relative"
          style={{ width: "min(72vw, 38vh)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/spf-sand.png"
            alt="SPF"
            draggable={false}
            className="h-auto w-full select-none"
          />
          {/* "Your" — overlaid in the whitespace above the SPF letters */}
          <motion.span
            className="absolute left-1/2 top-[2%] -translate-x-1/2 whitespace-nowrap text-center font-bold leading-[0.95] tracking-tight text-[#001050]"
            style={{ fontSize: "min(18vw, 10vh)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          >
            Your
          </motion.span>
          {/* "Status Protection Formulator" — overlaid in the whitespace below the sand */}
          <motion.span
            className="absolute bottom-[1%] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-bold leading-[0.95] tracking-tight text-[#001050]"
            style={{ fontSize: "min(6vw, 3.2vh)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
          >
            Status Protection Formulator
          </motion.span>
          {/* Crab — in the sand divet between P and F, slightly tilted right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/crab.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              width: "9%",
              left: "59%",
              bottom: "24%",
              transform: "rotate(5deg)",
              transformOrigin: "center bottom",
            }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="px-8 text-center leading-tight text-[#001050]/85"
          style={{
            fontSize: "min(5vw, 2.4vh)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
            marginTop: "clamp(2.5rem, 6vh, 4.5rem)",
          }}
        >
          Answer three questions.
          <br />
          Walk away with your Cannes status vibe...
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
          width={719}
          height={63}
          priority
          unoptimized
          className="h-auto select-none"
          style={{ width: "min(90vw, 44vh, 700px)" }}
        />
      </motion.div>
    </div>
  );
}


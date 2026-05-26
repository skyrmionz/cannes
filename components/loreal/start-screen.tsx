"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface StartScreenProps {
  onStart: () => void;
}

// Soft pastel-blue gradient matching the L'Oreal Figma reference.
const LOREAL_GRADIENT =
  "linear-gradient(180deg, #E6EEFB 0%, #BFD6F4 45%, #FAF5EE 100%)";

export function LorealStartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: LOREAL_GRADIENT }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Soft inner glass card frame — subtle rounded inset to match Figma */}
      <div className="pointer-events-none absolute inset-3 rounded-[40px] border border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.5)_inset]" />

      {/* L'Oreal wordmark */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex justify-center px-6 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          className="h-auto w-[min(48vw,200px)] select-none"
        />
      </motion.div>

      {/* Hero glasses video — sits between "Find" and "your" lines.
          Video is positioned absolutely so it can overlap the headline. */}
      <motion.div
        className="absolute inset-x-0 z-10 flex justify-center"
        style={{ top: "30%" }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
      >
        <GlassesMedia />
      </motion.div>

      {/* Headline — three stacked words with the glasses overlapping between Find and your */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-32 pt-32">
        <div className="flex flex-col items-center gap-1 text-[#001050]">
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 13vw, 5.25rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          >
            Find
          </motion.span>
          {/* Spacer roughly the height of the overlapping glasses */}
          <div className="h-[clamp(7rem,28vw,12rem)]" aria-hidden />
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 13vw, 5.25rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
          >
            your
          </motion.span>
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 13vw, 5.25rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
          >
            vibe
          </motion.span>
        </div>
      </div>

      {/* Powered by Agentforce — rendered as text + Salesforce cloud icon
          (the F1 PNG is white-on-dark; doesn't work on the light L'Oreal background) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex items-center justify-center gap-2 px-6 text-[#001050]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="text-[clamp(0.85rem,3.5vw,1.05rem)] font-semibold tracking-tight">
          Powered by Agentforce from
        </span>
        <Image
          src="/logos/salesforce.png"
          alt="Salesforce"
          width={180}
          height={120}
          className="h-[clamp(1.4rem,5vw,1.8rem)] w-auto select-none"
        />
      </motion.div>

      {/* Glassy "Let's glow" CTA — same Liquid Glass pattern as F1, label changed */}
      <div className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-6">
        <LetsGlowButton onClick={onStart} />
      </div>
    </motion.div>
  );
}

function GlassesMedia() {
  const [videoFailed, setVideoFailed] = useState(false);

  if (videoFailed) {
    return (
      <Image
        src="/loreal/holographic-glasses.png"
        alt="Holographic sunglasses"
        width={520}
        height={400}
        priority
        className="h-auto w-[min(72vw,420px)] select-none"
        style={{ filter: "drop-shadow(0 18px 40px rgba(180,140,255,0.35))" }}
      />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onError={() => setVideoFailed(true)}
      className="select-none"
      style={{
        width: "min(72vw, 420px)",
        height: "auto",
        filter: "drop-shadow(0 18px 40px rgba(180,140,255,0.35))",
      }}
    >
      <source src="/loreal/glasses-idle.mp4" type='video/mp4; codecs="hvc1"' />
      <source src="/loreal/glasses-idle.webm" type="video/webm" />
    </video>
  );
}

function LetsGlowButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="group pointer-events-auto relative isolate overflow-hidden rounded-full px-14 py-4 text-base font-semibold tracking-tight text-white"
      style={{
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        backdropFilter: "blur(22px) saturate(160%)",
        background:
          "linear-gradient(180deg, rgba(86,170,255,0.95) 0%, rgba(38,118,242,0.95) 100%)",
        boxShadow: [
          "0 1px 0 rgba(255,255,255,0.55) inset",
          "0 -1px 0 rgba(0,16,80,0.2) inset",
          "0 0 0 1px rgba(255,255,255,0.35) inset",
          "0 12px 36px rgba(0,80,200,0.35)",
        ].join(", "),
      }}
    >
      {/* Top specular edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-[1px] h-[1px] rounded-full opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Bottom soft refraction glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -bottom-3 h-3 rounded-full opacity-70 blur-md"
        style={{ background: "rgba(170,220,255,0.55)" }}
      />
      {/* Hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-[900ms] ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
        }}
      />
      {/* Active press darken */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-150 group-active:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,16,80,0.18) 0%, rgba(0,16,80,0.06) 100%)",
        }}
      />
      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,16,80,0.35)]">
        Let&apos;s glow
      </span>
    </motion.button>
  );
}

"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { CornerTap } from "@/components/ui/corner-tap";
import { TransparentVideoLoop } from "@/components/ui/transparent-video-loop";

interface StartScreenProps {
  onStart: () => void;
}

// Soft pastel sky-blue → cream gradient matching the L'Oreal Figma reference.
const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

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

      {/* Invisible cross-brand corner tap — top-left → /f1. */}
      <CornerTap to="/f1" />

      {/* Vertical flex column — logo / headline+glasses / powered-by+button.
          Predictable layout that doesn't overflow on tall or short viewports. */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-between px-6 py-8">
        {/* Top: L'Oreal wordmark */}
        <motion.div
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
            className="h-auto w-[min(42vw,180px)] select-none"
          />
        </motion.div>

        {/* Middle: headline column with inline glasses */}
        <div className="flex flex-col items-center gap-1 text-[#001050]">
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 16vw, 6rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          >
            Find
          </motion.span>
          <motion.div
            className="relative z-10 -mt-[90px] -mb-[60px] flex justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
          >
            <GlassesMedia />
          </motion.div>
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 16vw, 6rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
          >
            your
          </motion.span>
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 16vw, 6rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
          >
            vibe
          </motion.span>
        </div>

        {/* Bottom: powered-by + button stacked together */}
        <div className="flex flex-col items-center gap-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Image
              src="/loreal/powered-by-astro.png"
              alt="Powered by Agentforce from Salesforce"
              width={1140}
              height={120}
              priority
              className="h-auto w-[min(60vw,200px)] select-none"
            />
          </motion.div>
          <LetsGlowButton onClick={onStart} />
        </div>
      </div>
    </motion.div>
  );
}

function GlassesMedia() {
  return (
    <TransparentVideoLoop
      mp4Src="/loreal/glasses-idle.mp4"
      webmSrc="/loreal/glasses-idle.webm"
      width="min(50vw, 260px)"
      fallbackSrc="/loreal/holographic-glasses.png"
      fallbackAlt="Holographic sunglasses"
      className="select-none"
      filter="drop-shadow(0 18px 40px rgba(180,140,255,0.35))"
    />
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
        // Glassy + #1A6CF0 base — translucent overlay on top of the brand blue
        background:
          "linear-gradient(180deg, rgba(78,144,247,0.95) 0%, rgba(26,108,240,0.95) 60%, rgba(15,84,200,0.95) 100%)",
        boxShadow: [
          "0 1px 0 rgba(255,255,255,0.45) inset",
          "0 -1px 0 rgba(0,16,80,0.25) inset",
          "0 0 0 1px rgba(255,255,255,0.25) inset",
          "0 12px 36px rgba(15,84,200,0.45)",
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

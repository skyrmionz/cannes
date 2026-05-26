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

      {/* Invisible cross-brand corner tap — top-left → /f1.
          Lives inside the z-50 start screen so it isn't covered by the screen overlay. */}
      <CornerTap to="/f1" />

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

      {/* Headline + glasses — single flex column, sized to fit between the
          logo (top) and powered-by/button (bottom) without overflow. */}
      <div className="pointer-events-none absolute left-0 right-0 top-24 bottom-44 z-20 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-1 text-[#001050]">
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 11vw, 4rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          >
            What&apos;s
          </motion.span>
          <motion.div
            className="-my-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
          >
            <GlassesMedia />
          </motion.div>
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 11vw, 4rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
          >
            your
          </motion.span>
          <motion.span
            className="block text-center font-bold leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 11vw, 4rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
          >
            vibe?
          </motion.span>
        </div>
      </div>

      {/* Powered by Agentforce — dark variant for the light L'Oreal background */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex justify-center px-6"
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
          className="h-auto w-[min(80vw,320px)] select-none"
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
  return (
    <TransparentVideoLoop
      mp4Src="/loreal/glasses-idle.mp4"
      webmSrc="/loreal/glasses-idle.webm"
      width="min(40vw, 200px)"
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

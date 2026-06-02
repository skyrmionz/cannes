"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { CornerTap } from "@/components/ui/corner-tap";
import { LorealStartScreen } from "@/components/loreal/start-screen";
import { LorealIntroScreen } from "@/components/loreal/intro-screen";
import { LorealVibingScreen } from "@/components/loreal/vibing-screen";
import { LorealSunQuestionScreen } from "@/components/loreal/sun-question-screen";
import { LorealHydrationQuestionScreen } from "@/components/loreal/hydration-question-screen";
import {
  LorealAgendaQuestionScreen,
  type AgendaIndex,
} from "@/components/loreal/agenda-question-screen";
import { LorealAgentforceBufferScreen } from "@/components/loreal/agentforce-buffer-screen";
import { LorealPersonaScreen } from "@/components/loreal/persona-screen";

type Step =
  | "start"
  | "intro"
  | "vibing"
  | "sun"
  | "hydration"
  | "agenda"
  | "agentforce"
  | "persona";

const FULL_BLEED_STEPS: ReadonlyArray<Step> = ["vibing", "agentforce", "persona"];

const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

// Full-viewport sky tints applied by the sun question. Each is a layered
// gradient that paints warm light from the top of the page down. Stop 0
// is "no tint" — keeps the base gradient pristine. Stops 1 and 2 push the
// upper sky toward warm orange/amber as the sun rises.
//
// We crossfade these as opacity-transitioned layers behind everything else,
// so the gradient itself appears to morph smoothly. When the user leaves
// the sun question, the active tint fades out, leaving the base gradient.
// Returning to the sun question with a saved selection re-tints smoothly.
const SUN_TINTS: Record<0 | 1 | 2, string> = {
  0: "linear-gradient(180deg, rgba(255,200,140,0) 0%, rgba(255,200,140,0) 100%)",
  1: "linear-gradient(180deg, rgba(255,180,120,0.55) 0%, rgba(255,210,150,0.18) 45%, rgba(255,220,160,0) 75%, rgba(255,220,160,0) 100%)",
  2: "linear-gradient(180deg, rgba(255,150,70,0.78) 0%, rgba(255,190,110,0.4) 35%, rgba(255,220,150,0.12) 65%, rgba(255,235,180,0) 90%, rgba(255,235,180,0) 100%)",
};

function LorealContent() {
  const [step, setStep] = useState<Step>("start");

  // User selections live here so going forward/back through screens preserves
  // what the user already picked. Sun stop and hydration level both default
  // to 0; once the user touches them, the value sticks across remounts.
  const [sunStop, setSunStop] = useState<0 | 1 | 2>(0);
  const [hydrationLevel, setHydrationLevel] = useState<0 | 1 | 2>(0);
  const [agendaIndex, setAgendaIndex] = useState<AgendaIndex | null>(null);

  const goToIntro = useCallback(() => setStep("intro"), []);
  const goToVibing = useCallback(() => setStep("vibing"), []);
  const goToSun = useCallback(() => setStep("sun"), []);
  const goToHydration = useCallback(() => setStep("hydration"), []);
  const goToAgenda = useCallback(() => setStep("agenda"), []);
  const goToAgentforce = useCallback(() => setStep("agentforce"), []);
  const goToPersona = useCallback(() => setStep("persona"), []);
  const finishAndReset = useCallback(() => {
    setSunStop(0);
    setHydrationLevel(0);
    setAgendaIndex(null);
    setStep("start");
  }, []);

  // Active tint = current sun selection while on the sun question; otherwise
  // 0 (no tint), so leaving the question fades the warmth back out smoothly.
  const activeTint: 0 | 1 | 2 = step === "sun" ? sunStop : 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: LOREAL_GRADIENT }}
    >
      {/* Sun tint — full-viewport layer crossfaded between the three sky
          intensities. Lives behind every screen so the gradient appears to
          morph across the whole page, not just the sun screen's glass card. */}
      {([0, 1, 2] as const).map((lv) => (
        <div
          key={`tint-${lv}`}
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: SUN_TINTS[lv],
            opacity: activeTint === lv ? 1 : 0,
            transition: "opacity 900ms cubic-bezier(0.32,0.72,0,1)",
          }}
        />
      ))}

      {/* Droplet warm-up — preloads all 3 idles once the L'Oréal flow opens
          so the hydration screen is paint-ready by the time the user lands. */}
      <DropletPreload />

      {/* Persistent glass card — stays static while content transitions.
          Hidden on full-bleed screens (vibing buffer, agentforce buffer,
          persona reveal) so they read against the gradient directly. */}
      <AnimatePresence>
        {!FULL_BLEED_STEPS.includes(step) && (
          <motion.div
            key="glass-card"
            className="pointer-events-none absolute inset-3 z-10 rounded-[40px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              WebkitBackdropFilter: "blur(10px) saturate(120%)",
              backdropFilter: "blur(10px) saturate(120%)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.16) 100%)",
              boxShadow: [
                "0 0 0 1px rgba(255,255,255,0.45) inset",
                "0 1px 0 rgba(255,255,255,0.65) inset",
                "0 18px 50px rgba(120,160,220,0.18)",
              ].join(", "),
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistent corner-tap → /f1 */}
      <CornerTap to="/f1" />

      {/* Step content — cross-zooms in front of the static shell */}
      <AnimatePresence>
        {step === "start" && (
          <motion.div
            key="start"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealStartScreen onStart={goToIntro} />
          </motion.div>
        )}
        {step === "intro" && (
          <motion.div
            key="intro"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealIntroScreen onStart={goToVibing} />
          </motion.div>
        )}
        {step === "vibing" && (
          <motion.div
            key="vibing"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealVibingScreen onComplete={goToSun} />
          </motion.div>
        )}
        {step === "sun" && (
          <motion.div
            key="sun"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealSunQuestionScreen
              onNext={goToHydration}
              value={sunStop}
              onChange={setSunStop}
            />
          </motion.div>
        )}
        {step === "hydration" && (
          <motion.div
            key="hydration"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealHydrationQuestionScreen
              onNext={goToAgenda}
              onBack={goToSun}
              value={hydrationLevel}
              onChange={setHydrationLevel}
            />
          </motion.div>
        )}
        {step === "agenda" && (
          <motion.div
            key="agenda"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealAgendaQuestionScreen
              onNext={goToAgentforce}
              onBack={goToHydration}
              value={agendaIndex}
              onChange={setAgendaIndex}
            />
          </motion.div>
        )}
        {step === "agentforce" && (
          <motion.div
            key="agentforce"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <LorealAgentforceBufferScreen onComplete={goToPersona} />
          </motion.div>
        )}
        {step === "persona" && agendaIndex !== null && (
          <motion.div
            key="persona"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <LorealPersonaScreen
              sunStop={sunStop}
              hydrationLevel={hydrationLevel}
              agendaIndex={agendaIndex}
              onFinish={finishAndReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hidden video tags that preload (but do not render) the 3 hydration idle
// loops so by the time the user advances to the hydration screen the videos
// are already decoded and play instantly.
function DropletPreload() {
  const sources: ReadonlyArray<string> = [
    "/loreal/droplet-low-idle",
    "/loreal/droplet-mid-idle",
    "/loreal/droplet-full-idle",
    "/loreal/droplet-low-to-mid",
    "/loreal/droplet-mid-to-full",
    "/loreal/droplet-mid-to-low",
    "/loreal/droplet-full-to-mid",
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      style={{ left: -9999, top: -9999 }}
    >
      {sources.map((s) => (
        <video key={s} muted playsInline preload="auto" tabIndex={-1}>
          <source src={`${s}.mp4`} type='video/mp4; codecs="hvc1"' />
          <source src={`${s}.webm`} type="video/webm" />
        </video>
      ))}
    </div>
  );
}

export default function LorealPage() {
  return (
    <TransitionProvider>
      <LorealContent />
    </TransitionProvider>
  );
}

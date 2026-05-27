"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { CornerTap } from "@/components/ui/corner-tap";
import { LorealStartScreen } from "@/components/loreal/start-screen";
import { LorealIntroScreen } from "@/components/loreal/intro-screen";
import { LorealVibingScreen } from "@/components/loreal/vibing-screen";
import { LorealSunQuestionScreen } from "@/components/loreal/sun-question-screen";

type Step = "start" | "intro" | "vibing" | "sun";

const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

function LorealContent() {
  const [step, setStep] = useState<Step>("start");

  const goToIntro = useCallback(() => setStep("intro"), []);
  const goToVibing = useCallback(() => setStep("vibing"), []);
  const goToSun = useCallback(() => setStep("sun"), []);
  const goToNext = useCallback(() => {
    // Downstream not built yet — Next button is a no-op.
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: LOREAL_GRADIENT }}
    >
      {/* Persistent glass card — stays static while content transitions.
          Hidden on the vibing buffer screen so the carousels read full-bleed. */}
      <AnimatePresence>
        {step !== "vibing" && (
          <motion.div
            key="glass-card"
            className="pointer-events-none absolute inset-3 rounded-[40px]"
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
            <LorealSunQuestionScreen onNext={goToNext} />
          </motion.div>
        )}
      </AnimatePresence>
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

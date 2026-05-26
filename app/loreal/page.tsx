"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { LorealStartScreen } from "@/components/loreal/start-screen";
import { LorealIntroScreen } from "@/components/loreal/intro-screen";

type Step = "start" | "intro";

function LorealContent() {
  const [step, setStep] = useState<Step>("start");

  const goToIntro = useCallback(() => setStep("intro"), []);
  const goToNext = useCallback(() => {
    // Downstream not built yet — for now, return to start.
    setStep("start");
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* No `mode="wait"` — we want exit + enter to overlap so the zoom
          cross-fade lands continuously, with no flash of dark page. */}
      <AnimatePresence>
        {step === "start" && (
          <LorealStartScreen key="start" onStart={goToIntro} />
        )}
        {step === "intro" && (
          <LorealIntroScreen key="intro" onStart={goToNext} />
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

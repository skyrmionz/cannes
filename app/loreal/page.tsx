"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { LorealStartScreen } from "@/components/loreal/start-screen";

function LorealContent() {
  const [showStart, setShowStart] = useState(true);

  const handleStart = useCallback(() => {
    setShowStart(false);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Start screen — primary view. CornerTap → /f1 lives inside it
          so it isn't covered by the z-50 overlay. */}
      <AnimatePresence>
        {showStart && <LorealStartScreen onStart={handleStart} />}
      </AnimatePresence>

      {/* Placeholder shown after "Let's glow" — downstream questionnaire is hidden for now */}
      {!showStart && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{
            background:
              "linear-gradient(180deg, #E6EEFB 0%, #BFD6F4 45%, #FAF5EE 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="text-center text-[#001050]">
            <p className="text-2xl font-semibold tracking-tight">
              More to come — let&apos;s glow soon ✨
            </p>
            <button
              type="button"
              onClick={() => setShowStart(true)}
              className="mt-6 rounded-full border border-[#001050]/30 px-6 py-2 text-sm font-medium tracking-tight text-[#001050]/70 hover:bg-white/30"
            >
              Back to start
            </button>
          </div>
        </motion.div>
      )}
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

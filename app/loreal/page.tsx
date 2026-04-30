"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { GlassBackground } from "@/components/ui/glass-background";
import { LogoHeader } from "@/components/loreal/logo-header";
import { MirrorScreen } from "@/components/loreal/mirror-screen";
import { NameEntry } from "@/components/loreal/name-entry";
import { QuestionScreen, type LorealOption } from "@/components/loreal/question-screen";
import { LoadingScreen } from "@/components/loreal/loading-screen";
import { ResultScreen } from "@/components/loreal/result-screen";

const skinRoutineOptions: LorealOption[] = [
  { id: "quick", label: "Quick & Easy", icon: "zap" },
  { id: "light", label: "Light but Powerful", icon: "sparkles" },
  { id: "moderate", label: "Moderate but Thorough", icon: "flower" },
  { id: "meticulous", label: "Meticulous & Intensive", icon: "gem" },
];

const skinTypeOptions: LorealOption[] = [
  { id: "oily", label: "Oily", icon: "droplets" },
  { id: "dry", label: "Dry", icon: "sun" },
  { id: "sensitive", label: "Sensitive", icon: "heart" },
  { id: "normal", label: "Normal", icon: "circle-dot" },
];

const skincareProductOptions: LorealOption[] = [
  { id: "cleanser", label: "Cleanser", icon: "sparkle" },
  { id: "moisturizer", label: "Moisturizer", icon: "droplet" },
  { id: "serum", label: "Serum", icon: "flask" },
  { id: "sunscreen", label: "Sunscreen", icon: "shield" },
];

const skincareTimeOptions: LorealOption[] = [
  { id: "day", label: "Day", icon: "sun" },
  { id: "night", label: "Night", icon: "sun-moon" },
  { id: "both", label: "Both", icon: "sparkles" },
];

const stepVariants = {
  enter: (direction: number) => ({
    scale: direction > 0 ? 0.85 : 1.15,
    opacity: 0,
  }),
  center: {
    scale: 1,
    opacity: 1,
  },
  exit: (direction: number) => ({
    scale: direction > 0 ? 1.15 : 0.85,
    opacity: 0,
  }),
};

const stepTransition = {
  duration: 0.6,
  ease: "easeInOut" as const,
};

function LorealContent() {
  const [showStart, setShowStart] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [skinRoutine, setSkinRoutine] = useState<string | null>(null);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [preferredProduct, setPreferredProduct] = useState<string | null>(null);
  const [skincareTime, setSkincareTime] = useState<string | null>(null);

  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleStart = useCallback(() => {
    setShowStart(false);
  }, []);

  const handleBackToStart = useCallback(() => {
    setShowStart(true);
  }, []);

  const handleStartOver = useCallback(() => {
    setResetting(true);
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setName("");
      setSkinRoutine(null);
      setSkinType(null);
      setPreferredProduct(null);
      setSkincareTime(null);
      setShowStart(true);
      setResetting(false);
    }, 600);
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <NameEntry
            name={name}
            onNameChange={setName}
            onNext={goForward}
            onBack={handleBackToStart}
          />
        );
      case 2:
        return (
          <QuestionScreen
            title="What's your ideal skin routine?"
            options={skinRoutineOptions}
            selectedId={skinRoutine}
            onSelect={setSkinRoutine}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <QuestionScreen
            title="What would you say your skin type is?"
            options={skinTypeOptions}
            selectedId={skinType}
            onSelect={setSkinType}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <QuestionScreen
            title="What are your favorite types of skincare to use?"
            options={skincareProductOptions}
            selectedId={preferredProduct}
            onSelect={setPreferredProduct}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 5:
        return (
          <QuestionScreen
            title="What time in the day do you wear skincare?"
            options={skincareTimeOptions}
            selectedId={skincareTime}
            onSelect={setSkincareTime}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 6:
        return <LoadingScreen onComplete={goForward} />;
      case 7:
        return (
          <ResultScreen
            name={name}
            skinRoutine={skinRoutine!}
            skinType={skinType!}
            preferredProduct={preferredProduct!}
            onStartOver={handleStartOver}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GlassBackground
      containerClassName="!h-auto min-h-screen"
      className="flex min-h-screen w-full flex-col overflow-hidden"
    >
      {/* Fade-to-white overlay for Start Over transition */}
      <AnimatePresence>
        {resetting && (
          <motion.div
            className="fixed inset-0 z-[60] bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Mirror start screen overlay */}
      <AnimatePresence>
        {showStart && <MirrorScreen onStart={handleStart} />}
      </AnimatePresence>

      {/* Logo header — hidden on loading and result steps */}
      {!showStart && step < 6 && (
        <div className="relative z-30 px-6 pt-8 md:px-12 md:pt-10">
          <LogoHeader className="mb-4" />
        </div>
      )}

      {/* Step content — only this zooms */}
      {!showStart && (
        <div className="relative flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="absolute inset-0"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </GlassBackground>
  );
}

export default function LorealPage() {
  return (
    <TransitionProvider>
      <LorealContent />
    </TransitionProvider>
  );
}

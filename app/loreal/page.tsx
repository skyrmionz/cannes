"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { MirrorScreen } from "@/components/loreal/mirror-screen";
import { NameEntry } from "@/components/loreal/name-entry";
import { QuestionScreen, type LorealOption } from "@/components/loreal/question-screen";
import { LoadingScreen } from "@/components/loreal/loading-screen";
import { ResultScreen } from "@/components/loreal/result-screen";

const skinRoutineOptions: LorealOption[] = [
  { id: "quick", label: "Quick & Easy", icon: "zap" },
  { id: "light", label: "Light but Powerful", icon: "sparkles" },
  { id: "moderate", label: "Moderate but Thorough", icon: "layers" },
  { id: "meticulous", label: "Meticulous & Intensive", icon: "gem" },
];

const skinTypeOptions: LorealOption[] = [
  { id: "oily", label: "Oily", icon: "droplets" },
  { id: "dry", label: "Dry", icon: "sun" },
  { id: "combination", label: "Combination", icon: "circle-dot" },
  { id: "sensitive", label: "Sensitive", icon: "heart" },
];

const skincareProductOptions: LorealOption[] = [
  { id: "cleanser", label: "Cleanser", icon: "sparkle" },
  { id: "moisturizer", label: "Moisturizer", icon: "droplet" },
  { id: "serum", label: "Serum", icon: "flask" },
  { id: "sunscreen", label: "Sunscreen", icon: "shield" },
];

const stepVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const stepTransition = {
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1] as const,
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
        return <LoadingScreen onComplete={goForward} />;
      case 6:
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
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Fade-to-black overlay for Start Over transition */}
      <AnimatePresence>
        {resetting && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black"
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

      {/* Main experience content */}
      {!showStart && (
        <>
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
        </>
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

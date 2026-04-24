"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  TransitionProvider,
  usePageTransition,
} from "@/components/page-transition";
import { StartScreen } from "@/components/f1/start-screen";
import { IntroScreen } from "@/components/f1/intro-screen";
import { NameEntry } from "@/components/f1/name-entry";
import {
  QuestionScreen,
  type QuestionOption,
} from "@/components/f1/question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen } from "@/components/f1/result-screen";
import { SpeedLines } from "@/components/f1/speed-lines";

const drivingStyles: QuestionOption[] = [
  { id: "oversteer", label: "Oversteer", description: "Sharp and precise" },
  { id: "understeer", label: "Understeer", description: "Stable and smooth" },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "High-speed and intense",
  },
  { id: "smooth", label: "Smooth", description: "Minimal and efficient" },
];

const drivers: QuestionOption[] = [
  { id: "hamilton", label: "Lewis Hamilton", description: "The Icon" },
  { id: "verstappen", label: "Max Verstappen", description: "The Relentless" },
  { id: "leclerc", label: "Charles Leclerc", description: "The Romantic" },
  { id: "norris", label: "Lando Norris", description: "The Entertainer" },
];

const circuits: QuestionOption[] = [
  {
    id: "monaco",
    label: "Monaco Grand Prix",
    description: "Precision and prestige",
  },
  {
    id: "british",
    label: "British Grand Prix",
    description: "Historic and legendary",
  },
  {
    id: "italian",
    label: "Italian Grand Prix",
    description: "Speed and chaos",
  },
  {
    id: "singapore",
    label: "Singapore Grand Prix",
    description: "Brutal and raw",
  },
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

function F1Content() {
  const { navigateTo } = usePageTransition();

  const [showStart, setShowStart] = useState(true);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [driverName, setDriverName] = useState("");
  const [drivingStyle, setDrivingStyle] = useState<string | null>(null);
  const [driver, setDriver] = useState<string | null>(null);
  const [circuit, setCircuit] = useState<string | null>(null);

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

  const handleQuestionSelect = useCallback(
    (
      setter: (id: string) => void,
      id: string,
    ) => {
      setter(id);
      setTimeout(() => {
        setDirection(1);
        setStep((s) => s + 1);
      }, 400);
    },
    []
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return <IntroScreen onNext={goForward} />;
      case 2:
        return (
          <NameEntry
            driverName={driverName}
            onNameChange={setDriverName}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <QuestionScreen
            title="What's your driving style?"
            options={drivingStyles}
            selectedId={drivingStyle}
            onSelect={(id) => handleQuestionSelect(setDrivingStyle, id)}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <QuestionScreen
            title="Which driver resonates with you?"
            options={drivers}
            selectedId={driver}
            onSelect={(id) => handleQuestionSelect(setDriver, id)}
            onBack={goBack}
          />
        );
      case 5:
        return (
          <QuestionScreen
            title="Which circuit do you like to race on most?"
            options={circuits}
            selectedId={circuit}
            onSelect={(id) => handleQuestionSelect(setCircuit, id)}
            onBack={goBack}
          />
        );
      case 6:
        return <LoadingScreen onComplete={goForward} />;
      case 7:
        return (
          <ResultScreen
            driverName={driverName}
            onStartOver={() => navigateTo("/")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Start screen overlay */}
      <AnimatePresence>
        {showStart && <StartScreen onStart={handleStart} />}
      </AnimatePresence>

      {/* Main experience content */}
      {!showStart && (
        <>
          <SpeedLines />
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

export default function F1Page() {
  return (
    <TransitionProvider>
      <F1Content />
    </TransitionProvider>
  );
}

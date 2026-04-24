"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { StartScreen } from "@/components/f1/start-screen";
import { IntroScreen } from "@/components/f1/intro-screen";
import { NameEntry } from "@/components/f1/name-entry";
import {
  QuestionScreen,
  type QuestionOption,
  type PreviewConfig,
} from "@/components/f1/question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen } from "@/components/f1/result-screen";
import { SpeedLines } from "@/components/f1/speed-lines";

const drivers: QuestionOption[] = [
  {
    id: "hamilton",
    label: "Lewis Hamilton",
    description: "The Icon",
    image: "/f1/drivers/hamilton.png",
  },
  {
    id: "verstappen",
    label: "Max Verstappen",
    description: "The Relentless",
    image: "/f1/drivers/verstappen.png",
  },
  {
    id: "leclerc",
    label: "Charles Leclerc",
    description: "The Romantic",
    image: "/f1/drivers/leclerc.png",
  },
  {
    id: "norris",
    label: "Lando Norris",
    description: "The Entertainer",
    image: "/f1/drivers/norris.png",
  },
];

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

const circuits: QuestionOption[] = [
  {
    id: "monaco",
    label: "Monaco Grand Prix",
    description: "Precision and prestige",
    image: "/f1/circuits/monaco.png",
  },
  {
    id: "british",
    label: "British Grand Prix",
    description: "Historic and legendary",
    image: "/f1/circuits/british.png",
  },
  {
    id: "italian",
    label: "Italian Grand Prix",
    description: "Speed and chaos",
    image: "/f1/circuits/italian.png",
  },
  {
    id: "singapore",
    label: "Singapore Grand Prix",
    description: "Brutal and raw",
    image: "/f1/circuits/singapore.png",
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
  const [showStart, setShowStart] = useState(true);
  const [resetting, setResetting] = useState(false);
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
    (setter: (id: string) => void, id: string) => {
      setter(id);
    },
    []
  );

  const driverPreview: PreviewConfig = {
    type: "driver",
    carImages: {
      hamilton: "/f1/drivers/hamilton-car.png",
      verstappen: "/f1/drivers/verstappen-car.png",
      leclerc: "/f1/drivers/leclerc-car.png",
      norris: "/f1/drivers/norris-car.png",
    },
  };

  const stylePreview: PreviewConfig = {
    type: "style",
  };

  const circuitPreview: PreviewConfig = {
    type: "circuit",
  };

  const handleStartOver = useCallback(() => {
    setResetting(true);
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setDriverName("");
      setDrivingStyle(null);
      setDriver(null);
      setCircuit(null);
      setShowStart(true);
      setResetting(false);
    }, 600);
  }, []);

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
            title="Which driver resonates with you?"
            options={drivers}
            selectedId={driver}
            onSelect={(id) => handleQuestionSelect(setDriver, id)}
            onNext={goForward}
            onBack={goBack}
            preview={driverPreview}
          />
        );
      case 4:
        return (
          <QuestionScreen
            title="What's your driving style?"
            options={drivingStyles}
            selectedId={drivingStyle}
            onSelect={(id) => handleQuestionSelect(setDrivingStyle, id)}
            onNext={goForward}
            onBack={goBack}
            preview={stylePreview}
          />
        );
      case 5:
        return (
          <QuestionScreen
            title="Which circuit do you like to race on most?"
            options={circuits}
            selectedId={circuit}
            onSelect={(id) => handleQuestionSelect(setCircuit, id)}
            onNext={goForward}
            onBack={goBack}
            preview={circuitPreview}
          />
        );
      case 6:
        return <LoadingScreen onComplete={goForward} />;
      case 7:
        return (
          <ResultScreen
            driverName={driverName}
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

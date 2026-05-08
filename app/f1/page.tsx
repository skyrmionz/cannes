"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { StartScreen } from "@/components/f1/start-screen";
import { IntroScreen } from "@/components/f1/intro-screen";
import { NameEntry } from "@/components/f1/name-entry";
import { KnobQuestionScreen } from "@/components/f1/knob-question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen } from "@/components/f1/result-screen";
import { SpeedLines } from "@/components/f1/speed-lines";
import {
  grandPrixOptions,
  celebrations,
  teamOptions,
  personaOptions,
} from "./options";

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

function randomPersona(): string {
  return personaOptions[Math.floor(Math.random() * personaOptions.length)].id;
}

function F1Content() {
  const [showStart, setShowStart] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [driverName, setDriverName] = useState("");
  const [grandPrix, setGrandPrix] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  // Persona is never asked — assigned randomly when loading starts.
  const [persona, setPersona] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState<string | null>(null);

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

  const handleStartOver = useCallback(() => {
    setResetting(true);
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setDriverName("");
      setGrandPrix(null);
      setCelebration(null);
      setTeam(null);
      setPersona(null);
      setSongUrl(null);
      setShowStart(true);
      setResetting(false);
    }, 600);
  }, []);

  const handleLoadingStart = useCallback(() => {
    // Assign persona randomly at the moment we enter the loading screen.
    setPersona(randomPersona());
    goForward();
  }, [goForward]);

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
          <KnobQuestionScreen
            title="What is your favourite Grand Prix?"
            subtitle="Your answer controls the drum track — the heartbeat of your song."
            options={grandPrixOptions}
            selectedId={grandPrix}
            onSelect={setGrandPrix}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <KnobQuestionScreen
            title="Your driver just took the chequered flag. What do you do?"
            subtitle="This shapes the bass line — how much raw emotion drives your track."
            options={celebrations}
            selectedId={celebration}
            onSelect={setCelebration}
            onNext={goForward}
            onBack={goBack}
          />
        );
      case 5:
        return (
          <KnobQuestionScreen
            title="What is your favourite team?"
            subtitle="Your team picks the melody line — the musical identity that makes this track yours."
            options={teamOptions}
            selectedId={team}
            onSelect={setTeam}
            onNext={handleLoadingStart}
            onBack={goBack}
          />
        );
      case 6:
        return (
          <LoadingScreen
            driverName={driverName}
            grandPrix={grandPrix}
            celebration={celebration}
            team={team}
            onComplete={(url) => {
              setSongUrl(url);
              goForward();
            }}
            onError={goBack}
          />
        );
      case 7:
        return (
          <ResultScreen
            driverName={driverName}
            grandPrix={grandPrix}
            celebration={celebration}
            team={team}
            persona={persona}
            songUrl={songUrl}
            onStartOver={handleStartOver}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
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

      <AnimatePresence>
        {showStart && <StartScreen onStart={handleStart} />}
      </AnimatePresence>

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

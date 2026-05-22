"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TransitionProvider } from "@/components/page-transition";
import { StartScreen } from "@/components/f1/start-screen";
import { IntroScreen } from "@/components/f1/intro-screen";
import { NameEntry } from "@/components/f1/name-entry";
import { TransitionScreen } from "@/components/f1/transition-screen";
import { KnobQuestionScreen } from "@/components/f1/knob-question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen } from "@/components/f1/result-screen";
import { SpeedLines } from "@/components/f1/speed-lines";
import {
  drivingStyleOptions,
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

// Steps:
//   1 = Intro
//   2 = Name
//   3 = Transition (does not count toward progress bar question count)
//   4 = Q1 (circuit)      → stepIndex=0, totalSteps=3
//   5 = Q2 (celebration)  → stepIndex=1, totalSteps=3
//   6 = Q3 (team)         → stepIndex=2, totalSteps=3
//   7 = Loading
//   8 = Result

function F1Content() {
  const [showStart, setShowStart] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [driverName, setDriverName] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [grandPrix, setGrandPrix] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  // Persona is never asked — assigned randomly when loading starts.
  const [persona, setPersona] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
      setOptIn(false);
      setGrandPrix(null);
      setCelebration(null);
      setTeam(null);
      setPersona(null);
      setSongUrl(null);
      setSessionId(null);
      setShowStart(true);
      setResetting(false);
    }, 600);
  }, []);

  // Create a session row as soon as the user passes NameEntry so we have an ID
  // to attach screen_dropped events to during the question flow.
  const handleNameNext = useCallback(() => {
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: false, answers: {} }),
    })
      .then((r) => r.json())
      .then((d: { id: string }) => setSessionId(d.id))
      .catch(() => {});
    goForward();
  }, [goForward]);

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
            onNext={handleNameNext}
            onBack={goBack}
            onOptInChange={setOptIn}
          />
        );
      case 3:
        return (
          <TransitionScreen
            driverName={driverName}
            onContinue={goForward}
          />
        );
      case 4:
        return (
          <KnobQuestionScreen
            title="What's your driving style?"
            subtitle="Tap your circuit — this sets the rhythm of your track."
            options={drivingStyleOptions}
            selectedId={grandPrix}
            onSelect={setGrandPrix}
            onNext={goForward}
            onBack={goBack}
            stepIndex={0}
            totalSteps={3}
            sessionId={sessionId}
          />
        );
      case 5:
        return (
          <KnobQuestionScreen
            title="Lights out. Your driver wins. What do you do?"
            subtitle="Tap your reaction — this shapes the bass line."
            options={celebrations}
            selectedId={celebration}
            onSelect={setCelebration}
            onNext={goForward}
            onBack={goBack}
            stepIndex={1}
            totalSteps={3}
            sessionId={sessionId}
          />
        );
      case 6:
        return (
          <KnobQuestionScreen
            title="Who do you race for?"
            subtitle="Tap your team — this picks your melody."
            options={teamOptions}
            selectedId={team}
            onSelect={setTeam}
            onNext={handleLoadingStart}
            onBack={goBack}
            stepIndex={2}
            totalSteps={3}
            sessionId={sessionId}
          />
        );
      case 7:
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
      case 8:
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

  // Suppress unused warning — optIn is captured for future use (analytics/email)
  void optIn;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #022AC0 0%, #066AFE 55%, #00B3FF 100%)" }}>
      <AnimatePresence>
        {resetting && (
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: "linear-gradient(180deg, #022AC0 0%, #066AFE 55%, #00B3FF 100%)" }}
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

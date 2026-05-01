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
import {
  KnobQuestionScreen,
  type GrandPrixOption,
} from "@/components/f1/knob-question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen } from "@/components/f1/result-screen";
import { SpeedLines } from "@/components/f1/speed-lines";

const grandPrixOptions: GrandPrixOption[] = [
  {
    id: "spa",
    label: "Spa-Francorchamps",
    country: "Belgium",
    description:
      "Sweeping elevation changes through the Ardennes forest — raw, dramatic, unpredictable.",
    racePhoto: "/f1/circuits/photos/spa.jpg",
  },
  {
    id: "suzuka",
    label: "Suzuka",
    country: "Japan",
    description:
      "A figure-of-eight crossover masterpiece — technical, flowing, relentless.",
    racePhoto: "/f1/circuits/photos/suzuka.jpg",
  },
  {
    id: "monaco",
    label: "Monaco",
    country: "Monaco",
    description:
      "Precision and prestige through the streets of Monte Carlo — unforgiving, iconic.",
    racePhoto: "/f1/circuits/photos/monaco.jpg",
  },
  {
    id: "silverstone",
    label: "Silverstone",
    country: "United Kingdom",
    description:
      "High-speed corners and rich heritage — the birthplace of Formula 1.",
    racePhoto: "/f1/circuits/photos/british.jpg",
  },
  {
    id: "monza",
    label: "Monza",
    country: "Italy",
    description:
      "The Temple of Speed — flat-out, intense, electric atmosphere.",
    racePhoto: "/f1/circuits/photos/italian.png",
  },
];

const celebrations: GrandPrixOption[] = [
  {
    id: "jump",
    label: "Jump and Cheer",
    country: "Pure adrenaline",
    description: "",
    racePhoto: "/f1/emoji/raising-hands.png",
  },
  {
    id: "nod",
    label: "Nod and Smile",
    country: "Cool and collected",
    description: "",
    racePhoto: "/f1/emoji/smirk.png",
  },
  {
    id: "meltdown",
    label: "Total Meltdown",
    country: "Raw emotion",
    description: "",
    racePhoto: "/f1/emoji/exploding-head.png",
  },
];

const teams: QuestionOption[] = [
  { id: "racing-bulls", label: "Racing Bulls", description: "The proving ground for Red Bull's next generation — raw talent, rapid development.", image: "/f1/teams/cars/racing-bulls.png" },
  { id: "red-bull", label: "Red Bull Racing", description: "Four-time constructors' champions — relentless innovation, dominant pace.", image: "/f1/teams/cars/red-bull.png" },
  { id: "mclaren", label: "McLaren", description: "One of F1's most storied teams — a winning tradition reborn.", image: "/f1/teams/cars/mclaren.png" },
  { id: "ferrari", label: "Ferrari", description: "The most iconic name in motorsport — passion, drama, legacy.", image: "/f1/teams/cars/ferrari.png" },
  { id: "mercedes", label: "Mercedes", description: "Eight consecutive constructors' titles — engineering excellence defined.", image: "/f1/teams/cars/mercedes.png" },
  { id: "aston-martin", label: "Aston Martin", description: "British racing green ambition — building a dynasty from the ground up.", image: "/f1/teams/cars/aston-martin.png" },
  { id: "williams", label: "Williams", description: "Nine constructors' championships — a legendary name fighting back.", image: "/f1/teams/cars/williams.png" },
  { id: "alpine", label: "Alpine", description: "French flair meets racing pedigree — the spirit of Renault reborn.", image: "/f1/teams/cars/alpine.png" },
  { id: "audi", label: "Audi", description: "A new era begins — German engineering enters Formula 1.", image: "/f1/teams/cars/audi.png" },
  { id: "haas", label: "Haas F1 Team", description: "America's F1 team — grit, determination, and a growing presence.", image: "/f1/teams/cars/haas.png" },
  { id: "cadillac", label: "Cadillac", description: "The newest entry on the grid — American ambition at full throttle.", image: "/f1/teams/cars/cadillac.png" },
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
  const [celebration, setCelebration] = useState<string | null>(null);
  const [grandPrix, setGrandPrix] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);

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

  const teamPreview: PreviewConfig = {
    type: "team",
    teamLogos: {
      "racing-bulls": "/f1/teams/logos/racing-bulls.png",
      "red-bull": "/f1/teams/logos/red-bull.png",
      mclaren: "/f1/teams/logos/mclaren.png",
      ferrari: "/f1/teams/logos/ferrari.png",
      mercedes: "/f1/teams/logos/mercedes.png",
      "aston-martin": "/f1/teams/logos/aston-martin.png",
      williams: "/f1/teams/logos/williams.png",
      alpine: "/f1/teams/logos/alpine.png",
      audi: "/f1/teams/logos/audi.png",
      haas: "/f1/teams/logos/haas.png",
      cadillac: "/f1/teams/logos/cadillac.png",
    },
    teamDrivers: {
      "racing-bulls": "Yuki Tsunoda & Isack Hadjar",
      "red-bull": "Max Verstappen & Liam Lawson",
      mclaren: "Lando Norris & Oscar Piastri",
      ferrari: "Charles Leclerc & Lewis Hamilton",
      mercedes: "George Russell & Kimi Antonelli",
      "aston-martin": "Fernando Alonso & Lance Stroll",
      williams: "Carlos Sainz & Alex Albon",
      alpine: "Pierre Gasly & Jack Doohan",
      audi: "Nico Hülkenberg & Gabriel Bortoleto",
      haas: "Esteban Ocon & Oliver Bearman",
      cadillac: "TBA",
    },
  };

  const handleStartOver = useCallback(() => {
    setResetting(true);
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setDriverName("");
      setCelebration(null);
      setGrandPrix(null);
      setTeam(null);
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
          <QuestionScreen
            title="What is your favourite team?"
            subtitle="Your team picks the trumpet line — the melodic identity that makes this track yours."
            options={teams}
            selectedId={team}
            onSelect={(id) => handleQuestionSelect(setTeam, id)}
            onNext={goForward}
            onBack={goBack}
            preview={teamPreview}
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

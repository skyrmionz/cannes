"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { teamOptions } from "@/app/f1/options";

interface LoadingScreenProps {
  driverName: string;
  grandPrix: string | null;
  celebration: string | null;
  team: string | null;
  onComplete: (songUrl: string) => void;
  onError: () => void;
}

const TOTAL_MS = 3500;

const CIRCUIT_TO_D: Record<string, number> = {
  monza: 1, monaco: 2, spa: 3, silverstone: 4, suzuka: 5,
};
const CELEBRATION_TO_B: Record<string, number> = {
  jump: 1, nod: 2, meltdown: 3, frozen: 4, tears: 5,
};
const MELODY_GROUP_TO_S: Record<string, number> = {
  "red-bull": 1, ferrari: 2, mclaren: 3, mercedes: 4, haas: 5,
};

function songFilename(circuit: string, celebration: string, teamId: string): string {
  const teamOpt = teamOptions.find((t) => t.id === teamId);
  const melodyGroup = teamOpt?.melodyGroup ?? "red-bull";
  const d = CIRCUIT_TO_D[circuit] ?? 1;
  const b = CELEBRATION_TO_B[celebration] ?? 1;
  const s = MELODY_GROUP_TO_S[melodyGroup] ?? 1;
  return `/api/songs/F1_Cannes_D${d}B${b}S${s}_v03.wav`;
}

export function LoadingScreen({
  grandPrix,
  celebration,
  team,
  onComplete,
  onError,
}: LoadingScreenProps) {
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<"commentary" | "mastering">("commentary");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const circuit = grandPrix ?? "monaco";
    const cel = celebration ?? "jump";
    const songUrl = songFilename(circuit, cel, team ?? "red-bull");

    // Switch phases midway
    const phaseTimer = setTimeout(() => setPhase("mastering"), TOTAL_MS * 0.5);

    const timer = setTimeout(() => {
      onComplete(songUrl);
    }, TOTAL_MS);

    return () => {
      clearTimeout(timer);
      clearTimeout(phaseTimer);
    };
  }, [grandPrix, celebration, team, onComplete, onError]);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(180deg, #022AC0 35%, #066AFE 68%, #00B3FF 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Progress bar */}
      <div style={{ marginTop: 72, width: 730 }}>
        <Image src="/Progress bar95.png" alt="" width={1637} height={180} unoptimized style={{ width: "100%", height: "auto" }} />
      </div>

      {/* Title */}
      <motion.h1
        className="text-center font-extrabold text-white"
        style={{ fontSize: 132, lineHeight: 1.1, marginTop: 56, paddingLeft: 60, paddingRight: 60 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Your track is<br />almost ready
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-center text-white"
        style={{ fontSize: 48, lineHeight: 1.5, marginTop: 40, paddingLeft: 80, paddingRight: 80, opacity: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        Agentforce used real-time data to shape your track. It&apos;s just one of the ways Salesforce shapes incredible customer experiences.
      </motion.p>

      {/* Astro animation — switches from Anim1 to Anim2 when phase changes */}
      <motion.div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 22 }}
      >
        <video
          key={phase}
          src={phase === "commentary"
            ? "/Animations/Cannes-F1-Astro-Anim1_1.webm"
            : "/Animations/Cannes-F1-Astro-Anim2_1.webm"}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: 560, height: 560, objectFit: "contain", mixBlendMode: "multiply" }}
        />
      </motion.div>

      {/* Animated status lines */}
      <motion.div
        style={{ marginBottom: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <p className="text-center font-bold text-white" style={{ fontSize: 52 }}>
          Recording your race commentary…
        </p>
        <motion.p
          className="text-center font-bold text-white"
          style={{ fontSize: 52, paddingBottom: 120, }}
          initial={{ opacity: 1.0 }}
         
          transition={{ duration: 0.6 }}
        >
          Mastering the final cut...
        </motion.p>
      </motion.div>
    </div>
  );
}

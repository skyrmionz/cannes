"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { DotBg } from "./dot-bg";

interface TeamOption {
  id: string;
  label: string;
}

interface TeamSelectScreenProps {
  options: TeamOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── CIRCLE POSITIONS ─────────────────────────────────────────────────────────
// top/left = circle CENTER as % of the flex-1 track container.
// size     = diameter as % of container WIDTH (paddingBottom trick keeps circles square).
const TEAM_POSITIONS: Record<string, { top: string; left: string; size: string }> = {
  "racing-bulls":  { top: "2%", left: "10%", size: "16%" },
  "alpine":        { top: "2%", left: "39%", size: "16%" },
  "red-bull":      { top: "2%", left: "67%", size: "16%" },
  "mercedes":      { top: "25%", left: "82%", size: "16%" },
  "cadillac":      { top: "48%", left: "18%", size: "16%" },
  "haas":          { top: "48%", left: "41%", size: "18%" },
  "ferrari":       { top: "47%", left: "69%", size: "16%" },
  "williams":      { top: "69%", left: "2%", size: "16%" },
  "aston-martin":  { top: "93%", left: "18%", size: "16%" },
  "mclaren":       { top: "93%", left: "41%", size: "16%" },
  "audi":          { top: "93%", left: "69%", size: "16%" },
};
// ──────────────────────────────────────────────────────────────────────────────

const TEAM_LOGOS: Record<string, string> = {
  "racing-bulls":  "/f1/teams/revised-teams/Visa-CA-RB.png",
  "alpine":        "/f1/teams/revised-teams/Alpine.png",
  "red-bull":      "/f1/teams/revised-teams/Oracle-Redbull.png",
  "mercedes":      "/f1/teams/revised-teams/AMG-Petronas.png",
  "cadillac":      "/f1/teams/revised-teams/Cadillac.png",
  "haas":          "/f1/teams/revised-teams/Haas.png",
  "ferrari":       "/f1/teams/revised-teams/Ferrari.png",
  "williams":      "/f1/teams/revised-teams/Atlassian-Williams.png",
  "aston-martin":  "/f1/teams/revised-teams/Aston%20Martin-Aramco.png",
  "mclaren":       "/f1/teams/revised-teams/Mclaren.png",
  "audi":          "/f1/teams/revised-teams/Audi-Revolut.png",
};

export function TeamSelectScreen({
  options,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: TeamSelectScreenProps) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Progress bar */}
      <motion.div
        className="relative z-10 mx-auto mt-9 shrink-0"
        style={{ width: "67.5%", paddingTop: 68, }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Image src="/Progress bar60.png" alt="" width={1637} height={180} unoptimized className="w-full" />
      </motion.div>

      {/* Title */}
      <motion.div
        className="relative z-10 px-10 pt-4 shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2
          className="leading-tight text-white text-center font-extrabold"
          style={{ fontSize: 86, fontFamily: "var(--font-avant-garde)" , paddingLeft: 200, paddingRight: 200, paddingTop: 90 }}
        >
          Who do you bleed for?
        </h2>
        <p className="mt-2 text-white text-center" style={{ fontSize: 40, paddingLeft: 100, paddingRight: 100, paddingTop: 20  }}>
          Your team steers the melody that makes this beat yours.
        </p>
      </motion.div>

      {/* S-curve track with team circles */}
      <div className="relative z-10 mx-2" style={{ flex: "1 1 0", minHeight: 0, overflow: "visible" }}>

        {/* Road background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/road-screen6.png"
          alt=""
          className="pointer-events-none absolute"
          style={{ zIndex: 0, top: 120, left: 0, width: "100%", mixBlendMode: "screen",  transform: "scale(1.08)" }}
        />

        {/* Team circles — paddingBottom trick makes height = width (perfect square → circle) */}
        {options.map((team, i) => {
          const pos = TEAM_POSITIONS[team.id];
          const logo = TEAM_LOGOS[team.id];
          if (!pos || !logo) return null;
          const isSelected = selectedId === team.id;

          return (
            <motion.div
              key={team.id}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                width: pos.size,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 20 : 10,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isSelected ? 1.12 : 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 400, damping: 18 }}
            >
              <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                <button
                  onClick={() => onSelect(team.id)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "12%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected
                      ? "0 0 0 4px #0d7aff, 0 4px 20px rgba(0,0,0,0.3)"
                      : "0 4px 16px rgba(0,0,0,0.25)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt={team.label}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hint */}
      <p
        className="relative z-10 shrink-0 text-center text-white font-bold pb-2"
        style={{ fontSize: 35, fontFamily: "var(--font-avant-garde)" , paddingTop: 150,}}
      >
        Select your team<br />and click next
      </p>

      {/* Bottom nav */}
      <div className="relative z-10 shrink-0 flex items-center justify-between px-6 pb-10 pt-2">
        <motion.button
          onClick={onBack}
          style={{ background: "none", border: "none", padding: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ delay: 0.5 }}
        >
          <Image src="/f1/Buttons/Back.png" alt="Back" width={120} height={120} unoptimized style={{ width: 100, height: 100 }} />
        </motion.button>

        <motion.button
          onClick={selectedId ? onNext : undefined}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: selectedId ? "pointer" : "default",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedId ? 1 : 0.4 }}
          whileTap={selectedId ? { scale: 0.95 } : {}}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Image src="/f1/Buttons/Next.png" alt="Next" width={300} height={120} unoptimized style={{ width: 260, height: "auto" }} />
        </motion.button>
      </div>
    </div>
  );
}

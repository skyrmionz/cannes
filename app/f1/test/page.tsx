"use client";

import { useState } from "react";
import { KioskScaler } from "@/components/f1/kiosk-scaler";
import { StartScreen } from "@/components/f1/start-screen";
import { IntroScreen } from "@/components/f1/intro-screen";
import { NameEntry } from "@/components/f1/name-entry";
import { TransitionScreen } from "@/components/f1/transition-screen";
import { CircuitSelectScreen } from "@/components/f1/circuit-select-screen";
import { TeamSelectScreen } from "@/components/f1/team-select-screen";
import { KnobQuestionScreen } from "@/components/f1/knob-question-screen";
import { LoadingScreen } from "@/components/f1/loading-screen";
import { ResultScreen, QRScreen } from "@/components/f1/result-screen";
import { teamOptions, celebrations } from "@/app/f1/options";

// monza(D1) + jump(B1) + ferrari(S2) — matches default mock state below
const MOCK_SONG = "/api/songs/F1_Cannes_D1B1S2_v03.wav";
const MOCK_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const SCREENS = [
  { id: 0,  label: "1 – Start" },
  { id: 1,  label: "2 – Intro" },
  { id: 2,  label: "3 – Name Entry" },
  { id: 3,  label: "4 – Transition" },
  { id: 4,  label: "5 – Circuit Select" },
  { id: 5,  label: "6 – Team Select" },
  { id: 6,  label: "7 – Knob Question" },
  { id: 7,  label: "8 – Loading" },
  { id: 8,  label: "9 – Result (mixer)" },
  { id: 9,  label: "10 – QR Screen (kiosk)" },
  { id: 10, label: "11 – QR Landing (phone)", note: "no slider, inline video" },
];

export default function TestPage() {
  const [active, setActive] = useState<number | null>(null);
  const [name, setName] = useState("Alex");
  const [circuit, setCircuit] = useState<string | null>("monza");
  const [team, setTeam] = useState<string | null>("ferrari");
  const [celebration, setCelebration] = useState<string | null>("jump");

  const back = () => setActive(null);

  if (active !== null) {
    // Screen 11 (QR landing / phone shared view) runs outside KioskScaler —
    // it's a mobile page, not a kiosk canvas.
    if (active === 10) {
      return (
        <div className="relative">
          <BackButton onClick={back} />
          <ResultScreen
            driverName={name}
            grandPrix={circuit}
            celebration={celebration}
            team={team}
            persona="racer"
            songUrl={MOCK_SONG}
            videoUrl={MOCK_VIDEO}
            onStartOver={back}
            sharedView
          />
        </div>
      );
    }

    return (
      <div className="relative">
        <BackButton onClick={back} />
        <KioskScaler>
          {active === 0 && <StartScreen onStart={back} />}
          {active === 1 && <IntroScreen onNext={back} />}
          {active === 2 && (
            <NameEntry
              driverName={name}
              onNameChange={setName}
              onNext={back}
              onBack={back}
            />
          )}
          {active === 3 && (
            <TransitionScreen driverName={name} onContinue={back} />
          )}
          {active === 4 && (
            <CircuitSelectScreen
              selectedId={circuit}
              onSelect={setCircuit}
              onNext={back}
              onBack={back}
            />
          )}
          {active === 5 && (
            <TeamSelectScreen
              options={teamOptions}
              selectedId={team}
              onSelect={setTeam}
              onNext={back}
              onBack={back}
            />
          )}
          {active === 6 && (
            <KnobQuestionScreen
              title="How would you react if you won a Cannes Lion?"
              subtitle="This shapes the bass line and how much raw emotion drives your track."
              options={celebrations}
              selectedId={celebration}
              onSelect={setCelebration}
              onNext={back}
              onBack={back}
              stepIndex={1}
              totalSteps={3}
              progressImage="/Progress bar80.png"
              sessionId={null}
            />
          )}
          {active === 7 && (
            <LoadingScreen
              driverName={name}
              grandPrix={circuit}
              celebration={celebration}
              team={team}
              onComplete={back}
              onError={back}
            />
          )}
          {active === 8 && (
            <ResultScreen
              driverName={name}
              grandPrix={circuit}
              celebration={celebration}
              team={team}
              persona="racer"
              songUrl={MOCK_SONG}
              onStartOver={back}
              onNext={back}
            />
          )}
          {active === 9 && (
            <QRScreen
              driverName={name}
              shareUrl="https://example.com/f1/result/test123"
              onStartOver={back}
            />
          )}
        </KioskScaler>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: 32, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "white", fontSize: 24, marginBottom: 8 }}>F1 Screen Tester</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32 }}>
        Jump to any screen with mock data. Song uses a public MP3.
      </p>

      {/* Mock data controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <label style={{ color: "white", fontSize: 13 }}>
          Name&nbsp;
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ background: "#1a1a2e", color: "white", border: "1px solid #333", borderRadius: 4, padding: "4px 8px", marginLeft: 4 }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {SCREENS.map(({ id, label, note }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            style={{
              background: "#1a1a3e",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "16px 20px",
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2a2a5e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1a1a3e")}
          >
            <div>{label}</div>
            {note && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{note}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed", top: 12, right: 12, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", color: "white",
        border: "none", borderRadius: 8, padding: "6px 14px",
        fontSize: 14, cursor: "pointer",
      }}
    >
      ← Back to picker
    </button>
  );
}

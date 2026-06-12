"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { DotBg } from "./dot-bg";

interface CircuitSelectScreenProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const CIRCUITS = [
  { id: "monza",  label: "You like consistency.",                      img: "/f1/circuits/Permanent Race Circuit Card.png", video: "/Animations/Cannes-F1-tile-Tachometer_1.webm" },
  { id: "monaco", label: "You take risks and leave no room for error.", img: "/f1/circuits/Fast Street Circuit Card.png",    video: null },
  { id: "spa",    label: "You like to shake it up.",                   img: "/f1/circuits/Mixed Road Circuit Card.png",     video: "/Animations/Cannes-F1-tile-tirespin_1.webm" },
];

function CircuitCard({
  circuit,
  isSelected,
  onTap,
}: {
  circuit: (typeof CIRCUITS)[0];
  isSelected: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      onClick={onTap}
      style={{
        flex: 1,
        outline: "none",
        background: "none",
        border: "none",
        padding: 0,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: isSelected
          ? "0 0 0 4px rgba(255,255,255,0.9), 0 0 24px rgba(0,180,255,0.7)"
          : "0 4px 16px rgba(0,0,0,0.4)",
      }}
      animate={{ scale: isSelected ? 1.06 : 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={circuit.img}
        alt={circuit.label}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {circuit.video && (
        <video
          src={circuit.video}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}
    </motion.button>
  );
}

export function CircuitSelectScreen({
  selectedId,
  onSelect,
  onNext,
  onBack,
}: CircuitSelectScreenProps) {
  const [, setTapped] = useState<string | null>(null);

  const handleTap = useCallback((id: string) => {
    setTapped(id);
    onSelect(id);
  }, [onSelect]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Progress bar */}
      <motion.div
        className="relative z-10 mx-auto mt-29 shrink-0"
        style={{ width: "67.5%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Image src="/Progress bar40.png" alt="" width={1637} height={180} unoptimized className="w-full" />
      </motion.div>

      {/* Title */}
      <motion.div
        className="relative z-10 px-8 pt-5 shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h2
          className="text-center font-extrabold leading-tight text-white"
          style={{ fontSize: 96, paddingTop: 80, fontFamily: "var(--font-avant-garde)" }}
        >
          What&apos;s your racing style?
        </h2>
        <p
          className="mt-3 text-center text-white"
          style={{ fontSize: 40, paddingLeft: 100, paddingRight: 100, fontWeight: 300 }}
        >
          Your answer dials up the drums and tells me your tolerance for pressure.
        </p>
      </motion.div>

      {/* Road + cards — road sits behind the cards */}
      <div className="relative z-10 flex-1 flex flex-col justify-center" style={{ minHeight: 0 }}>

        {/* Road background — positioned to fill the flex-1 zone */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/road-screen5.png"
          alt=""
          className="pointer-events-none absolute"
          style={{ zIndex: 0, top: 160, left: 0, width: "100%", mixBlendMode: "screen",  transform: "scale(1.20)" }}
        />

        {/* ─── 3 circuit cards ─────────────────────────────────────────
            Line 109: gap between cards (px)
            Line 110: horizontal padding either side (px)
        ──────────────────────────────────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-row items-center"
          style={{
            gap: 50,        // line 109 — gap between cards
            paddingLeft: 70,  // line 110 — left/right padding
            paddingRight: 90,
            paddingBottom: 10,
          }}
        >
          {CIRCUITS.map((circuit, i) => (
            <motion.div
              key={circuit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <CircuitCard
                circuit={circuit}
                isSelected={selectedId === circuit.id}
                onTap={() => handleTap(circuit.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <motion.p
        className="relative z-10 shrink-0 text-center font-bold text-white pb-2"
        style={{ fontSize: 34, fontFamily: "var(--font-avant-garde)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Select your circuit<br />and click next
      </motion.p>

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
          <Image src="/f1/Buttons/Back.png" alt="Back" width={120} height={120} unoptimized />
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
          <Image src="/f1/Buttons/Next.png" alt="Next" width={300} height={120} unoptimized />
        </motion.button>
      </div>
    </div>
  );
}

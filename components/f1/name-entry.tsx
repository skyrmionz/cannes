"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { DotBg } from "./dot-bg";

interface NameEntryProps {
  driverName: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
  onOptInChange?: (v: boolean) => void;
}

const ALPHA_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["SHIFT","Z","X","C","V","B","N","M","BACK"],
  ["NUM","SPACE","RETURN"],
];

const NUM_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["-","/",":",";","(",")","\$","&","@",'"'],
  ["ALPHA",".",",'","?","!","'","BACK"],
  ["ALPHA","SPACE","RETURN"],
];

function KbKey({
  label,
  flex,
  caps,
  onPress,
}: {
  label: string;
  flex: number;
  caps: boolean;
  onPress: () => void;
}) {
  const [down, setDown] = useState(false);

  const isShift = label === "SHIFT";
  const isBack = label === "BACK";
  const isSpace = label === "SPACE";
  const isReturn = label === "RETURN";
  const isMode = label === "NUM" || label === "ALPHA";

  const KEY_BG = "#C2D8F8";
  const KEY_BG_DOWN = "#93BBEF";
  const KEY_COLOR = "#0A2580";

  const bg = down ? KEY_BG_DOWN : KEY_BG;

  const displayLabel = () => {
    if (isShift) return (
      <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 13h5v3h3v5h4v-5h3v-3h5L12 3z" fill={KEY_COLOR} />
      </svg>
    );
    if (isBack) return (
      <svg width="55%" height="55%" viewBox="0 0 44 30" fill="none">
        <path d="M15 1H41C42.1 1 43 1.9 43 3V27C43 28.1 42.1 29 41 29H15L1 15L15 1Z" stroke={KEY_COLOR} strokeWidth="2.5" fill="none" />
        <path d="M22 10L32 20M32 10L22 20" stroke={KEY_COLOR} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
    if (isSpace) return "space";
    if (isReturn) return "return";
    if (label === "NUM") return "123";
    if (label === "ALPHA") return "ABC";
    return caps ? label.toUpperCase() : label.toLowerCase();
  };

  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); setDown(true); onPress(); }}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        flex,
        height: "clamp(56px, 9vw, 120px)",
        background: bg,
        borderRadius: "clamp(10px, 1.2vw, 18px)",
        color: KEY_COLOR,
        fontWeight: 400,
        fontSize: isShift || isBack
          ? 0
          : isMode || isSpace || isReturn
          ? "clamp(1rem, 2.4vw, 2.2rem)"
          : "clamp(1.3rem, 3.2vw, 2.8rem)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
        cursor: "pointer",
        transition: "background 0.07s",
        minWidth: 0,
        letterSpacing: "0.01em",
      }}
    >
      {displayLabel()}
    </button>
  );
}

export function NameEntry({
  driverName,
  onNameChange,
  onNext,
  onBack,
  onOptInChange,
}: NameEntryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [optIn, setOptIn] = useState(false);
  const [highlightCheckbox, setHighlightCheckbox] = useState(false);
  const [caps, setCaps] = useState(true);
  const [numMode, setNumMode] = useState(false);

  const triggerCheckboxAlert = () => {
    setHighlightCheckbox(true);
    setTimeout(() => setHighlightCheckbox(false), 2500);
  };

  const handleOptInChange = (v: boolean) => {
    setOptIn(v);
    if (v) setHighlightCheckbox(false);
    onOptInChange?.(v);
  };

  const canProceed = driverName.trim().length > 0 && optIn;

  const handleNext = () => {
    if (!optIn) { triggerCheckboxAlert(); return; }
    if (!driverName.trim()) return;
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed) onNext();
  };

  const handleVirtualKey = (label: string) => {
    if (label === "BACK") { onNameChange(driverName.slice(0, -1)); return; }
    if (label === "SPACE") { onNameChange(driverName + " "); return; }
    if (label === "RETURN") { handleNext(); return; }
    if (label === "SHIFT") { setCaps((c) => !c); return; }
    if (label === "NUM") { setNumMode(true); return; }
    if (label === "ALPHA") { setNumMode(false); return; }
    const ch = caps ? label.toUpperCase() : label.toLowerCase();
    onNameChange(driverName + ch);
  };

  const rows = numMode ? NUM_ROWS : ALPHA_ROWS;
  const GAP = "clamp(5px, 0.7vw, 9px)";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Progress bar */}
      <motion.div
        className="relative z-10 mx-auto mt-9 shrink-0"
        style={{ width: "67.5%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Image
          src="/Progress bar20.png"
          alt="20% progress"
          width={1637}
          height={180}
          unoptimized
          className="w-full"
        />
      </motion.div>

      {/* Title + subtitle */}
      <div className="relative z-10 flex flex-col items-center px-8 pt-[6vh] shrink-0">
        <motion.h2
          className="font-bold text-white text-center"
          style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", lineHeight: 1.1, fontFamily: "var(--font-avant-garde)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          What&apos;s your name, driver?
        </motion.h2>

        <motion.p
          className="mt-3 text-white text-center"
          style={{ fontSize: "clamp(1.2rem, 2.8vw, 2.4rem)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          I&apos;ll add you into the track.
        </motion.p>
      </div>

      <div className="flex-1" />

      {/* Input + checkbox */}
      <div className="relative z-10 px-6 pb-3 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {/* Slack-style message box */}
          <div
            className="relative w-full bg-white"
            style={{
              borderRadius: "clamp(14px, 1.8vw, 28px)",
              border: highlightCheckbox ? "2px solid #ff4444" : "1.5px solid #D1D1D6",
              boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
              minHeight: "clamp(100px, 12vh, 170px)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              inputMode="none"
              value={driverName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your name"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              name="driver-name"
              className="w-full bg-transparent outline-none"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)",
                padding: "clamp(1.2rem, 2.5vh, 2rem) clamp(1.4rem, 3.5vw, 2.5rem)",
                paddingRight: "clamp(4rem, 9vw, 7rem)",
                caretColor: "#001050",
                color: driverName ? "#001050" : undefined,
                verticalAlign: "top",
                display: "block",
              }}
            />
            {/* Send arrow — bottom right, using the Slack send button asset */}
            <button
              onClick={handleNext}
              className="absolute bottom-0 right-0 flex items-center justify-center"
              style={{
                opacity: canProceed ? 1 : 0.35,
                transition: "opacity 0.2s",
                padding: "clamp(0.8rem, 2vh, 1.6rem)",
              }}
            >
              <Image
                src="/f1/slack-text-entry/slack-send-button.png"
                alt="Send"
                width={80}
                height={80}
                unoptimized
                style={{
                  width: "clamp(36px, 4.5vw, 64px)",
                  height: "clamp(36px, 4.5vw, 64px)",
                  objectFit: "contain",
                }}
              />
            </button>
          </div>
        </motion.div>

        {/* Opt-in checkbox */}
        <motion.label
          className="mt-4 flex cursor-pointer items-center gap-3"
          style={{
            color: highlightCheckbox ? "white" : "rgba(255,255,255,0.85)",
            fontSize: "clamp(0.85rem, 1.8vw, 1.5rem)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <motion.div
            animate={highlightCheckbox ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0"
          >
            <div
              className="relative flex items-center justify-center rounded border-2 border-white/70 bg-white"
              style={{
                width: "clamp(22px, 2.8vw, 38px)",
                height: "clamp(22px, 2.8vw, 38px)",
                minWidth: "clamp(22px, 2.8vw, 38px)",
              }}
              onClick={() => handleOptInChange(!optIn)}
            >
              {optIn && (
                <svg width="60%" height="60%" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#001050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <input
                type="checkbox"
                checked={optIn}
                onChange={(e) => handleOptInChange(e.target.checked)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </motion.div>
          <span>Opt in for personalized quiz results only. We never sell your data.</span>
        </motion.label>

        <AnimatePresence>
          {highlightCheckbox && (
            <motion.p
              className="mt-2 font-semibold text-red-400"
              style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.3rem)" }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Please agree to continue
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Always-on virtual keyboard */}
      <div
        className="relative z-10 px-4 pb-5 pt-3 shrink-0"
        style={{ display: "flex", flexDirection: "column", gap: GAP }}
      >
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", gap: GAP, justifyContent: "center" }}>
            {row.map((key) => {
              let flex = 1;
              if (key === "SPACE") flex = 3.5;
              else if (key === "RETURN" || key === "NUM" || key === "ALPHA") flex = 1.4;
              else if (key === "SHIFT" || key === "BACK") flex = 1.4;
              return (
                <KbKey
                  key={key}
                  label={key}
                  flex={flex}
                  caps={caps}
                  onPress={() => handleVirtualKey(key)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

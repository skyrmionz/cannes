"use client";

import { useEffect, useState, useCallback } from "react";

// Every key the controller should send, with a description of what it does in the app.
const EXPECTED_KEYS = [
  { key: "0", label: "Slider zone 0", expect: "Selects option 1 of 5" },
  { key: "1", label: "Slider zone 1", expect: "Selects option 1 of 5" },
  { key: "2", label: "Slider zone 2", expect: "Selects option 2 of 5" },
  { key: "3", label: "Slider zone 3", expect: "Selects option 2 of 5" },
  { key: "4", label: "Slider zone 4", expect: "Selects option 3 of 5" },
  { key: "5", label: "Slider zone 5", expect: "Selects option 3 of 5" },
  { key: "6", label: "Slider zone 6", expect: "Selects option 4 of 5" },
  { key: "7", label: "Slider zone 7", expect: "Selects option 4 of 5" },
  { key: "8", label: "Slider zone 8", expect: "Selects option 5 of 5" },
  { key: "9", label: "Slider zone 9", expect: "Selects option 5 of 5" },
  { key: "a", label: "Button A",      expect: "Confirms selection / Next screen" },
  { key: "b", label: "Button B",      expect: "Goes back to previous screen" },
];

type KeyState = "waiting" | "ok" | "detected";

interface KeyLog {
  key: string;
  timestamp: string;
}

export default function ControllerTestPage() {
  const [states, setStates]   = useState<Record<string, KeyState>>(() =>
    Object.fromEntries(EXPECTED_KEYS.map((k) => [k.key, "waiting"]))
  );
  const [log, setLog]         = useState<KeyLog[]>([]);
  const [lastKey, setLastKey] = useState<string | null>(null);

  const allPassed = EXPECTED_KEYS.every((k) => states[k.key] === "ok");

  const reset = useCallback(() => {
    setStates(Object.fromEntries(EXPECTED_KEYS.map((k) => [k.key, "waiting"])));
    setLog([]);
    setLastKey(null);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      setLastKey(e.key);
      setLog((prev) => [
        { key: e.key, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 49),
      ]);
      setStates((prev) => {
        if (prev[k] === undefined) return prev;
        return { ...prev, [k]: "ok" };
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 font-mono text-white">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-2 h-[2px] w-12 bg-[#E10600]" />
        <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-white">
          Controller Test
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          F1 TrackStar — Cannes Lions 2026
        </p>

        {/* Pass/fail banner */}
        <div className={`mt-6 rounded-sm px-4 py-3 text-sm font-semibold uppercase tracking-wider ${
          allPassed
            ? "bg-green-900 text-green-300"
            : "bg-neutral-800 text-neutral-400"
        }`}>
          {allPassed
            ? "✓ All keys detected — controller is working correctly"
            : `Waiting for ${EXPECTED_KEYS.filter((k) => states[k.key] === "waiting").length} key(s)...`}
        </div>

        {/* Last key detected */}
        <div className="mt-4 flex items-center gap-3 text-sm text-neutral-500">
          <span>Last key received:</span>
          <span className={`rounded-sm px-3 py-1 text-base font-bold ${
            lastKey ? "bg-[#E10600] text-white" : "bg-neutral-800 text-neutral-600"
          }`}>
            {lastKey ?? "—"}
          </span>
        </div>

        {/* Key checklist */}
        <div className="mt-6 space-y-2">
          {EXPECTED_KEYS.map(({ key, label, expect }) => {
            const state = states[key];
            return (
              <div
                key={key}
                className={`flex items-center gap-4 rounded-sm px-4 py-3 transition-colors ${
                  state === "ok"
                    ? "bg-green-900/30 border border-green-800"
                    : "bg-neutral-900 border border-neutral-800"
                }`}
              >
                {/* Status indicator */}
                <div className={`h-2 w-2 flex-shrink-0 rounded-full ${
                  state === "ok" ? "bg-green-400" : "bg-neutral-600"
                }`} />

                {/* Key badge */}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-sm font-bold uppercase ${
                  state === "ok" ? "bg-green-700 text-white" : "bg-neutral-800 text-neutral-300"
                }`}>
                  {key}
                </div>

                {/* Label + expected behaviour */}
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white">
                    {label}
                  </p>
                  <p className="text-[11px] text-neutral-500">{expect}</p>
                </div>

                {/* Tick */}
                <div className="text-sm">
                  {state === "ok" ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-neutral-700">○</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Raw event log */}
        <div className="mt-8">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-neutral-600">
            Raw key log
          </p>
          <div className="h-36 overflow-y-auto rounded-sm bg-neutral-900 p-3">
            {log.length === 0 ? (
              <p className="text-[11px] text-neutral-700">No keys received yet — press a key or move the slider.</p>
            ) : (
              log.map((entry, i) => (
                <div key={i} className="flex gap-3 text-[11px]">
                  <span className="text-neutral-600">{entry.timestamp}</span>
                  <span className="text-[#E10600] font-bold">{entry.key}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reset + instructions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={reset}
            className="rounded-sm border border-neutral-700 px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 transition-colors hover:border-[#E10600] hover:text-white"
          >
            Reset
          </button>
          <p className="text-[11px] text-neutral-600">
            Share this URL with the vendor:{" "}
            <span className="text-neutral-400">/controller-test</span>
          </p>
        </div>

        {/* Instructions for vendor */}
        <div className="mt-6 rounded-sm border border-neutral-800 p-4 text-[11px] text-neutral-500 leading-relaxed">
          <p className="mb-1 font-semibold uppercase tracking-wider text-neutral-400">Instructions</p>
          <p>1. Connect the controller to the test machine via USB.</p>
          <p>2. Open this page in Chrome (full screen recommended).</p>
          <p>3. Move the slider slowly from bottom to top — all zones 0–9 should turn green.</p>
          <p>4. Press Button A — it should turn green.</p>
          <p>5. Press Button B — it should turn green.</p>
          <p>6. Screenshot the green "All keys detected" banner and send to Poz.</p>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { CinematicScene } from "./result-cinematic/scene";
import { ConfettiOverlay } from "./result-cinematic/confetti-overlay";
import { SongVisualizer, type VisualizerHandle } from "./song-visualizer";
import { useVideoExport } from "@/hooks/use-video-export";
import {
  grandPrixOptions,
  celebrations,
  teamOptions,
} from "@/app/f1/options";

interface ResultScreenProps {
  driverName: string;
  grandPrix: string | null;
  celebration: string | null;
  team: string | null;
  persona: string | null;
  songUrl: string | null;
  onStartOver: () => void;
  sharedView?: boolean;
}

// How long the DNA panel stays visible before the 3D scene takes over (ms)
const DNA_PANEL_MS = 5000;

interface DnaRowProps {
  layer: string;
  label: string;
  note: string;
  delay: number;
  color: string;
}

function DnaRow({ layer, label, note, delay, color }: DnaRowProps) {
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div
        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm text-[10px] font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: color }}
      >
        {layer}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-400">{note}</p>
      </div>
    </motion.div>
  );
}

export function ResultScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  persona,
  songUrl,
  onStartOver,
  sharedView = false,
}: ResultScreenProps) {
  const [showDna, setShowDna] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareErrored, setShareErrored] = useState(false);
  const [commentaryUrl, setCommentaryUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const sharedRef = useRef(false);
  const commentaryRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const playedRef = useRef(false);
  const visualizerRef = useRef<VisualizerHandle | null>(null);

  const { status: exportStatus, progress: exportProgress, videoUrl, startExport } = useVideoExport({
    songUrl,
    shareCode,
    visualizerRef,
    teamId: team ?? "red-bull",
    driverName,
  });

  // Auto-dismiss DNA panel after DNA_PANEL_MS
  useEffect(() => {
    const t = setTimeout(() => setShowDna(false), DNA_PANEL_MS);
    return () => clearTimeout(t);
  }, []);

  // Log completed session on mount
  useEffect(() => {
    if (sharedView) return;
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: true,
        answers: { name: driverName, circuit: grandPrix, celebration, team, persona },
      }),
    })
      .then((r) => r.json())
      .then((d: { id: string }) => { sessionIdRef.current = d.id; })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackPlay = useCallback(() => {
    if (playedRef.current || !sessionIdRef.current) return;
    playedRef.current = true;
    fetch(`/api/session/${sessionIdRef.current}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ played: true }),
    }).catch(() => {});
  }, []);

  // Resolve labels + music notes from options
  const circuitOpt  = grandPrixOptions.find((o) => o.id === grandPrix);
  const celebOpt    = celebrations.find((o) => o.id === celebration);
  const teamOpt     = teamOptions.find((o) => o.id === team);

  // Fetch personalised commentary audio once on mount
  useEffect(() => {
    if (commentaryRef.current) return;
    commentaryRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:        driverName,
            grandPrix:   circuitOpt?.label  ?? grandPrix ?? "Monaco",
            celebration: celebOpt?.label    ?? celebration ?? "jump",
            team:        teamOpt?.label     ?? team ?? "the team",
          }),
          signal: controller.signal,
        });
        if (res.ok && res.headers.get("Content-Type")?.startsWith("audio/")) {
          const blob = await res.blob();
          setCommentaryUrl(URL.createObjectURL(blob));
        }
      } catch {
        // Commentary is enhancement-only
      }
    })();

    return () => controller.abort();
  }, [driverName, grandPrix, celebration, team, circuitOpt, celebOpt, teamOpt]);

  // Create share link
  useEffect(() => {
    if (sharedView) return;
    if (!team || !persona || !songUrl) return;
    if (sharedRef.current) return;
    sharedRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverName, team, persona, mp3Url: songUrl }),
          signal: controller.signal,
        });
        if (!res.ok) { setShareErrored(true); return; }
        const { code } = (await res.json()) as { code: string };
        setShareCode(code);
        if (typeof window !== "undefined") {
          setShareUrl(`${window.location.origin}/f1/result/${code}`);
        }
      } catch {
        setShareErrored(true);
      }
    })();
    return () => controller.abort();
  }, [driverName, team, persona, songUrl, sharedView]);

  const handlePlayFallback = useCallback(() => {
    if (!songUrl) return;
    if (!fallbackAudioRef.current) {
      fallbackAudioRef.current = new Audio(songUrl);
    }
    fallbackAudioRef.current.play().then(() => setAutoplayBlocked(false));
    trackPlay();
  }, [songUrl, trackPlay]);

  const handleDownload = useCallback(async () => {
    if (!songUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(songUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(driverName || "my").toLowerCase().replace(/\s+/g, "-")}-anthem.wav`;
      a.click();
      URL.revokeObjectURL(url);
      if (sessionIdRef.current) {
        fetch(`/api/session/${sessionIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloaded: true }),
        }).catch(() => {});
      }
    } catch {
      // Download failed silently
    } finally {
      setDownloading(false);
    }
  }, [songUrl, driverName]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />
      <ConfettiOverlay />

      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

      <div className="relative z-10 px-6 pt-3 md:px-12 md:pt-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-2 h-[2px] w-16 bg-[#E10600]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <div className="flex items-center gap-4">
            <SlackbotAvatar className="h-10 w-10 flex-shrink-0 md:h-12 md:w-12" />
            <motion.h1
              className="text-xl font-semibold uppercase tracking-[0.15em] text-white md:text-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              Congratulations, welcome to the Cannes podium,{" "}
              <span className="text-[#E10600]">{driverName}</span>!
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Main content area — DNA panel fades into 3D scene */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {showDna ? (
            <motion.div
              key="dna"
              className="mx-auto w-full max-w-lg px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <motion.p
                className="mb-5 text-[11px] uppercase tracking-[0.25em] text-[#E10600]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your track DNA
              </motion.p>

              <div className="space-y-5">
                <DnaRow
                  layer="▶"
                  label={`Drums — ${circuitOpt?.label ?? grandPrix ?? "—"}`}
                  note={circuitOpt?.musicNote ?? "Rhythm section"}
                  delay={0.3}
                  color="#E10600"
                />
                <DnaRow
                  layer="◈"
                  label={`Bass — ${celebOpt?.label ?? celebration ?? "—"}`}
                  note={celebOpt?.musicNote ?? "Low end"}
                  delay={0.5}
                  color="#3a3a6a"
                />
                <DnaRow
                  layer="♪"
                  label={`Melody — ${teamOpt?.label ?? team ?? "—"}`}
                  note={teamOpt?.musicNote ?? "Harmonic layer"}
                  delay={0.7}
                  color="#1a5c3a"
                />
              </div>

              {/* Progress bar counting down to scene */}
              <div className="mt-8 h-[2px] w-full overflow-hidden bg-neutral-800">
                <motion.div
                  className="h-full bg-[#E10600]"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: DNA_PANEL_MS / 1000, ease: "linear" }}
                />
              </div>
              <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Podium loading…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="scene"
              className="relative w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{ height: "calc(100vh - 220px)", minHeight: "300px" }}
            >
              {team && persona ? (
                <CinematicScene
                  teamId={team}
                  personaId={persona}
                  songUrl={songUrl}
                  commentaryUrl={commentaryUrl}
                  onAudioBlocked={() => setAutoplayBlocked(true)}
                  onAudioStarted={trackPlay}
                />
              ) : null}

              {autoplayBlocked && songUrl && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={handlePlayFallback}
                    className="pointer-events-auto flex items-center gap-3 rounded-sm bg-[#E10600] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b80500]"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play your anthem
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR + visualizer — only visible once scene is showing */}
        {!sharedView && !showDna && (
          <div className="relative z-30 flex flex-col items-center gap-3 pb-2">

            {/* Visualizer canvas — hidden off-screen for export, shown when toggled */}
            <div className={showVisualizer ? "block" : "sr-only pointer-events-none absolute opacity-0"}>
              <SongVisualizer
                ref={visualizerRef}
                teamId={team ?? "red-bull"}
                driverName={driverName}
                width={540}
                height={540}
                className="h-48 w-48 rounded-sm"
              />
            </div>

            {/* Video export progress */}
            {(exportStatus === "encoding" || exportStatus === "uploading") && (
              <motion.div
                className="flex w-48 flex-col items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-neutral-800">
                  <motion.div
                    className="h-full bg-[#E10600]"
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                  {exportStatus === "uploading" ? "Uploading…" : `Rendering ${exportProgress}%`}
                </p>
              </motion.div>
            )}

            {/* Video download button once done */}
            {exportStatus === "done" && videoUrl && (
              <motion.a
                href={videoUrl}
                download="my-anthem.mp4"
                className="flex items-center gap-2 rounded-sm bg-[#E10600] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                ↓ Download MP4
              </motion.a>
            )}

            {/* Make video button */}
            {exportStatus === "idle" && shareCode && songUrl && (
              <button
                onClick={() => { setShowVisualizer(true); startExport(); }}
                className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-white"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-800 text-[9px] font-bold text-white">▶</span>
                Make video
              </button>
            )}

            {exportStatus === "unsupported" && (
              <p className="text-[10px] text-neutral-600">Video export needs Chrome</p>
            )}

            {/* QR code */}
            {shareUrl ? (
              <motion.div
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="rounded-sm bg-white p-2">
                  <QRCodeSVG value={shareUrl} size={80} bgColor="#FFFFFF" fgColor="#000000" level="M" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Scan to save your song
                </p>
              </motion.div>
            ) : shareErrored || !songUrl ? null : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-[80px] w-[80px] animate-pulse rounded-sm bg-neutral-800" />
                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                  Preparing link…
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-40 px-4 pb-4 pt-2 md:px-8 md:pb-6">
        <motion.div
          className="mx-auto flex max-w-5xl items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {songUrl && !sharedView && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-xs font-bold leading-none text-white">
                ↓
              </span>
              {downloading ? "Downloading…" : "Download"}
            </button>
          )}
          <button
            onClick={onStartOver}
            className="ml-auto flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#E10600] text-xs font-bold leading-none text-white">
              R
            </span>
            {sharedView ? "Start your engine" : "Start Over"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

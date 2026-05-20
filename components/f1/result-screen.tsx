"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader } from "./logo-header";
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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErrored, setShareErrored] = useState(false);
  const sharedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const playedRef = useRef(false);
  const commentaryRef = useRef(false);

  const circuitOpt = grandPrixOptions.find((o) => o.id === grandPrix);
  const celebOpt = celebrations.find((o) => o.id === celebration);
  const teamOpt = teamOptions.find((o) => o.id === team);

  // Log session
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

  // Autoplay commentary in background on kiosk (no UI blocker)
  useEffect(() => {
    if (!songUrl || sharedView) return;
    if (commentaryRef.current) return;
    commentaryRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        // Play the song stem silently in background so the room hears it
        const audio = new Audio(songUrl);
        audio.volume = 0.85;
        await audio.play().catch(() => {});

        // Then fetch and overlay commentary
        const res = await fetch("/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: driverName,
            grandPrix: circuitOpt?.label ?? grandPrix ?? "Monaco",
            celebration: celebOpt?.label ?? celebration ?? "jump",
            team: teamOpt?.label ?? team ?? "the team",
          }),
          signal: controller.signal,
        });
        if (res.ok && res.headers.get("Content-Type")?.startsWith("audio/")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const commentary = new Audio(url);
          commentary.volume = 1;
          await commentary.play().catch(() => {});
        }
      } catch {
        // Commentary is enhancement-only
      }
    })();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track first play
  const trackPlay = useCallback(() => {
    if (playedRef.current || !sessionIdRef.current) return;
    playedRef.current = true;
    fetch(`/api/session/${sessionIdRef.current}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ played: true }),
    }).catch(() => {});
  }, []);

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
        if (typeof window !== "undefined") {
          setShareUrl(`${window.location.origin}/f1/result/${code}`);
        }
      } catch {
        setShareErrored(true);
      }
    })();
    return () => controller.abort();
  }, [driverName, team, persona, songUrl, sharedView]);

  // ── Shared / phone view ──────────────────────────────────────────────────
  if (sharedView) {
    return <SharedPhoneView songUrl={songUrl} driverName={driverName} onTrackPlay={trackPlay} />;
  }

  // ── Kiosk view ───────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex h-screen flex-col items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1aaa 0%, #1a6aff 60%, #4a9fff 100%)" }}
    >
      {/* Vertical light streaks background */}
      <LightStreaks />

      {/* Logos */}
      <motion.div
        className="relative z-10 flex flex-col items-center pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
        <p className="mt-1 text-[11px] tracking-[0.12em] text-white/60">
          Global Partner of Formula 1®
        </p>
      </motion.div>

      {/* Main copy */}
      <motion.div
        className="relative z-10 mt-8 px-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
          Take your<br />track home
        </h1>
        <p className="mt-4 text-base font-medium leading-snug text-white/80">
          Whether you won a Cannes Lion or not, let<br />
          this track fuel your next award season.
        </p>
      </motion.div>

      {/* QR code */}
      <motion.div
        className="relative z-10 mt-8 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="rounded-3xl bg-white p-5 shadow-2xl" style={{ minWidth: 220, minHeight: 220 }}>
          {shareUrl ? (
            <QRCodeSVG value={shareUrl} size={190} bgColor="#FFFFFF" fgColor="#000000" level="M" />
          ) : shareErrored ? (
            <div className="flex h-[190px] w-[190px] items-center justify-center text-xs text-gray-400">
              Link unavailable
            </div>
          ) : (
            <div className="h-[190px] w-[190px] animate-pulse rounded-xl bg-gray-100" />
          )}
        </div>
      </motion.div>

      {/* CTA below QR */}
      <motion.p
        className="relative z-10 mt-5 px-8 text-center text-base font-bold leading-snug text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Scan the QR code for a copy of<br />
        your F1® podium track and<br />
        visualizer to share
      </motion.p>

      {/* Restart button */}
      <motion.div
        className="relative z-10 mt-auto w-full px-6 pb-8 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <button
          onClick={onStartOver}
          className="w-full rounded-full bg-white/20 py-4 text-base font-bold tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Restart
        </button>
      </motion.div>
    </div>
  );
}

// ── Shared phone view ────────────────────────────────────────────────────────

function SharedPhoneView({
  songUrl,
  driverName,
  onTrackPlay,
}: {
  songUrl: string | null;
  driverName: string;
  onTrackPlay: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!songUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(songUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
        onTrackPlay();
      }).catch(() => {});
    }
  }, [songUrl, playing, onTrackPlay]);

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
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  }, [songUrl, driverName]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: "linear-gradient(180deg, #0a1aaa 0%, #1a6aff 60%, #4a9fff 100%)" }}
    >
      <LightStreaks />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Your F1® Anthem
          </h1>
          {driverName && (
            <p className="mt-2 text-base text-white/70">
              Made for <span className="font-bold text-white">{driverName}</span>
            </p>
          )}
        </div>

        {/* Play button */}
        <button
          onClick={togglePlay}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl transition-transform active:scale-95"
        >
          {playing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#001050">
              <rect x="5" y="4" width="4" height="16" rx="1" />
              <rect x="15" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#001050">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <p className="text-sm text-white/60">
          {playing ? "Playing your anthem…" : "Tap to play your anthem"}
        </p>

        {/* Download */}
        {songUrl && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {downloading ? "Downloading…" : "↓ Download track"}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ── Light streaks background decoration ─────────────────────────────────────

function LightStreaks() {
  const streaks = Array.from({ length: 18 }, (_, i) => ({
    x: 5 + i * 5.5,
    delay: i * 0.08,
    height: 40 + ((i * 37) % 50),
    opacity: 0.08 + ((i * 13) % 20) / 100,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-[1.5px] rounded-full bg-white"
          style={{ left: `${s.x}%`, height: `${s.height}%`, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 3, s.opacity] }}
          transition={{ delay: s.delay, duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

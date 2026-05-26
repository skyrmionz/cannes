"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader } from "./logo-header";
import { AudioReactiveStreaks } from "./audio-reactive-streaks";
import {
  grandPrixOptions,
  celebrations,
  teamOptions,
} from "@/app/f1/options";

// Lottie loaded client-side only (no SSR)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
  const [kioskPlaying, setKioskPlaying] = useState(false);
  const [kioskAudioEl, setKioskAudioEl] = useState<HTMLAudioElement | null>(null);
  const [kioskAnalyser, setKioskAnalyser] = useState<AnalyserNode | null>(null);
  const [reverbWet, setReverbWet] = useState(0);
  const [confettiData, setConfettiData] = useState<object | null>(null);
  const [showConfetti, setShowConfetti] = useState(!sharedView);
  const sharedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const playedRef = useRef(false);
  const commentaryRef = useRef(false);
  const kioskAudioRef = useRef<HTMLAudioElement | null>(null);
  const kioskCommentaryRef = useRef<HTMLAudioElement | null>(null);
  const reverbWetRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);

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

  // Load Lottie confetti JSON once and auto-dismiss after 2.8s
  useEffect(() => {
    if (sharedView) return;
    fetch("/lottie/confetti.json")
      .then((r) => r.json())
      .then((data) => setConfettiData(data))
      .catch(() => {});
    const t = setTimeout(() => setShowConfetti(false), 2800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build audio graph: source → analyser → dry/wet reverb → destination
  useEffect(() => {
    if (!songUrl || sharedView) return;
    if (commentaryRef.current) return;
    commentaryRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const CtxCls =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        const audio = new Audio(songUrl);
        audio.volume = 0.85;
        audio.crossOrigin = "anonymous";
        kioskAudioRef.current = audio;
        audio.onplay = () => setKioskPlaying(true);
        audio.onpause = () => setKioskPlaying(false);
        audio.onended = () => setKioskPlaying(false);
        setKioskAudioEl(audio);

        if (CtxCls) {
          const ctx = new CtxCls();
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;

          // Dry / wet gains for reverb
          const dryGain = ctx.createGain();
          const wetGain = ctx.createGain();
          dryGain.gain.value = 1;
          wetGain.gain.value = 0;
          reverbDryRef.current = dryGain;
          reverbWetRef.current = wetGain;

          // Synthetic impulse reverb (2.5 s exponential decay)
          const convolver = ctx.createConvolver();
          const irLen = ctx.sampleRate * 2.5;
          const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const d = irBuf.getChannelData(ch);
            for (let i = 0; i < irLen; i++) {
              d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.5);
            }
          }
          convolver.buffer = irBuf;

          // source → analyser → dry → destination
          //                  → convolver → wet → destination
          source.connect(analyser);
          analyser.connect(dryGain);
          analyser.connect(convolver);
          convolver.connect(wetGain);
          dryGain.connect(ctx.destination);
          wetGain.connect(ctx.destination);

          setKioskAnalyser(analyser);

          audio.addEventListener("play", () => ctx.resume().catch(() => {}));
        }

        await audio.play().catch(() => {});

        // Overlay commentary
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
          kioskCommentaryRef.current = commentary;

          // Keep commentary in sync with main track
          audio.addEventListener("pause", () => commentary.pause());
          audio.addEventListener("play", () => {
            if (!commentary.ended) commentary.play().catch(() => {});
          });

          await commentary.play().catch(() => {});
        }
      } catch {
        // Audio is enhancement-only
      }
    })();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply reverb wet/dry when slider changes
  useEffect(() => {
    if (!reverbWetRef.current || !reverbDryRef.current) return;
    reverbWetRef.current.gain.value = reverbWet;
    reverbDryRef.current.gain.value = 1 - reverbWet * 0.6;
  }, [reverbWet]);

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
          body: JSON.stringify({ driverName, team, persona, mp3Url: songUrl, grandPrix, celebration }),
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
      style={{ background: "linear-gradient(180deg, #022AC0 0%, #066AFE 55%, #00B3FF 100%)" }}
    >
      {/* Audio-reactive light streaks background */}
      <AudioReactiveStreaks audioElement={kioskAudioEl} analyserNode={kioskAnalyser} />

      {/* Lottie confetti burst on reveal */}
      <AnimatePresence>
        {showConfetti && confettiData && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Lottie
              animationData={confettiData}
              loop={false}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* DRS reverb fader + play/restart */}
      <motion.div
        className="relative z-10 mt-auto w-full px-6 pb-8 pt-4 flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {/* DRS reverb fader */}
        <div className="flex flex-col gap-1">
          <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-white">Deploy DRS</p>
          <p className="text-center text-[10px] text-white/50">Add atmosphere to your track</p>
        </div>
        <ReverbSlider value={reverbWet} onChange={setReverbWet} />

        {/* Play / Pause */}
        {kioskAudioEl && (
          <button
            onClick={() => {
              if (kioskPlaying) {
                kioskAudioEl.pause();
              } else {
                kioskAudioEl.play().catch(() => {});
              }
            }}
            className="w-full rounded-full bg-white/20 py-4 text-base font-bold tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {kioskPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        )}

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

// ── Reverb wet/dry slider ────────────────────────────────────────────────────

function ReverbSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const pctFromPointer = (clientX: number) => {
    if (!trackRef.current) return value;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - left) / width));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    onChange(pctFromPointer(e.clientX));
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    onChange(pctFromPointer(e.clientX));
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    onChange(pctFromPointer(e.clientX));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Dry</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">Reverb</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Wet</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-[52px] touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Rail */}
        <div className="pointer-events-none absolute inset-x-0 top-[25px] h-[2px] rounded-full bg-white/20" />
        {/* Fill */}
        <div
          className="pointer-events-none absolute top-[25px] h-[2px] rounded-full bg-white/60"
          style={{ left: 0, width: `${value * 100}%` }}
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-[11px]"
          style={{ left: `${value * 100}%`, transform: "translateX(-50%)" }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
            }}
          />
        </div>
      </div>
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
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [reverbWet, setReverbWet] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reverbWetRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);

  const togglePlay = useCallback(() => {
    if (!songUrl) return;
    if (!audioRef.current) {
      const a = new Audio(songUrl);
      a.crossOrigin = "anonymous";
      a.onended = () => setPlaying(false);
      audioRef.current = a;
      setAudioEl(a);

      // Build audio graph for phone view too
      const CtxCls =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (CtxCls) {
        try {
          const ctx = new CtxCls();
          const source = ctx.createMediaElementSource(a);
          const dryGain = ctx.createGain();
          const wetGain = ctx.createGain();
          dryGain.gain.value = 1;
          wetGain.gain.value = 0;
          reverbDryRef.current = dryGain;
          reverbWetRef.current = wetGain;

          const convolver = ctx.createConvolver();
          const irLen = ctx.sampleRate * 2.5;
          const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const d = irBuf.getChannelData(ch);
            for (let i = 0; i < irLen; i++) {
              d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.5);
            }
          }
          convolver.buffer = irBuf;

          source.connect(dryGain);
          source.connect(convolver);
          convolver.connect(wetGain);
          dryGain.connect(ctx.destination);
          wetGain.connect(ctx.destination);

          a.addEventListener("play", () => ctx.resume().catch(() => {}));
        } catch {
          // Reverb is enhancement only
        }
      }
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

  // Sync reverb on phone view
  useEffect(() => {
    if (!reverbWetRef.current || !reverbDryRef.current) return;
    reverbWetRef.current.gain.value = reverbWet;
    reverbDryRef.current.gain.value = 1 - reverbWet * 0.6;
  }, [reverbWet]);

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
      style={{ background: "linear-gradient(180deg, #022AC0 0%, #066AFE 55%, #00B3FF 100%)" }}
    >
      <AudioReactiveStreaks audioElement={audioEl} />

      <motion.div
        className="relative z-10 flex w-full flex-col items-center gap-8 text-center"
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

        {/* Deploy DRS reverb slider */}
        <div className="w-full max-w-xs flex flex-col gap-1">
          <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-white">Deploy DRS</p>
          <p className="text-center text-[10px] text-white/50">Add atmosphere to your track</p>
          <ReverbSlider value={reverbWet} onChange={setReverbWet} />
        </div>

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

"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader } from "./logo-header";
import { AudioReactiveStreaks } from "./audio-reactive-streaks";
import { drawSinWaveFrame } from "./sin-wave-lines";
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
  commentaryUrl?: string | null;
  videoUrl?: string | null;
  onStartOver: () => void;
  onNext?: () => void;
  onShareReady?: (url: string) => void;
  sharedView?: boolean;
}

// Champagne spray canvas — fires on mount, runs for ~3s then fades
const ChampagneCanvas = memo(function ChampagneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Bottle positions — bottom-left, bottom-center, bottom-right
    const BOTTLES = [
      { x: 0.15, active: true },
      { x: 0.5,  active: true },
      { x: 0.85, active: true },
    ];

    const COLORS = [
      "rgba(255,255,255,",
      "rgba(255,240,180,",
      "rgba(200,240,255,",
      "rgba(255,220,80,",
    ];

    interface Drop {
      x: number; y: number;
      vx: number; vy: number;
      life: number; decay: number;
      size: number; color: string;
    }

    const drops: Drop[] = [];
    let elapsed = 0;
    let last = performance.now();
    let rafId = 0;

    function spawnBottle(bx: number) {
      // Fan of 8-12 drops per burst
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7;
        const speed = 3 + Math.random() * 5;
        drops.push({
          x: bx * canvas!.width,
          y: canvas!.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.015,
          size: 2 + Math.random() * 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    function tick(now: number) {
      const dt = (now - last) / 16.67; // normalized to 60fps
      last = now;
      elapsed += dt / 60;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn bursts for first 2.5s
      if (elapsed < 2.5) {
        BOTTLES.forEach((b) => {
          if (b.active && Math.random() < 0.35) spawnBottle(b.x);
        });
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 0.18 * dt; // gravity
        d.life -= d.decay * dt;
        if (d.life <= 0) { drops.splice(i, 1); continue; }
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
        ctx!.fillStyle = d.color + (d.life * 0.85) + ")";
        ctx!.fill();
      }

      if (elapsed < 4 || drops.length > 0) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-40 h-full w-full"
    />
  );
});

export function ResultScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  persona,
  songUrl,
  commentaryUrl = null,
  videoUrl = null,
  onStartOver,
  onNext,
  onShareReady,
  sharedView = false,
}: ResultScreenProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErrored, setShareErrored] = useState(false);
  const [kioskPlaying, setKioskPlaying] = useState(false);
  const [kioskAudioEl, setKioskAudioEl] = useState<HTMLAudioElement | null>(null);
  const [kioskAnalyser, setKioskAnalyser] = useState<AnalyserNode | null>(null);
  const [reverbWet, setReverbWet] = useState(0);
  const [pitRadioOn, setPitRadioOn] = useState(false);
  const [crowdOn, setCrowdOn] = useState(false);
  const [confettiData, setConfettiData] = useState<object | null>(null);
  const [showConfetti, setShowConfetti] = useState(!sharedView);
  const sharedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const playedRef = useRef(false);
  const commentaryRef = useRef(false);
  const commentaryVoiceRef = useRef<string | null>(null);
  const kioskAudioRef = useRef<HTMLAudioElement | null>(null);
  const kioskCommentaryRef = useRef<HTMLAudioElement | null>(null);
  const reverbWetRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);
  const pitLowRef = useRef<BiquadFilterNode | null>(null);
  const pitHighRef = useRef<BiquadFilterNode | null>(null);
  const pitGainRef = useRef<GainNode | null>(null);
  const crowdAudioRef = useRef<HTMLAudioElement | null>(null);
  const crowdGainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

          // Pit Lane Radio: bandpass 300–3000 Hz + mild distortion gain, bypassed by default
          const pitLow = ctx.createBiquadFilter();
          pitLow.type = "highpass";
          pitLow.frequency.value = 300;
          const pitHigh = ctx.createBiquadFilter();
          pitHigh.type = "lowpass";
          pitHigh.frequency.value = 3000;
          const pitGain = ctx.createGain();
          pitGain.gain.value = 0; // off by default
          analyser.connect(pitLow);
          pitLow.connect(pitHigh);
          pitHigh.connect(pitGain);
          pitGain.connect(ctx.destination);
          pitLowRef.current = pitLow;
          pitHighRef.current = pitHigh;
          pitGainRef.current = pitGain;

          // Crowd: gain node for looped crowd audio (HTML audio element created on first toggle)
          const crowdGain = ctx.createGain();
          crowdGain.gain.value = 0;
          crowdGain.connect(ctx.destination);
          crowdGainRef.current = crowdGain;

          audioCtxRef.current = ctx;
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
          const voiceId = res.headers.get("X-Commentary-Voice");
          if (voiceId) commentaryVoiceRef.current = voiceId;
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

  // Pit Lane Radio toggle
  useEffect(() => {
    if (!pitGainRef.current || !reverbDryRef.current) return;
    pitGainRef.current.gain.value = pitRadioOn ? 1.4 : 0;
    reverbDryRef.current.gain.value = pitRadioOn ? 0 : 1 - reverbWet * 0.6;
  }, [pitRadioOn, reverbWet]);

  // Crowd Roar toggle
  useEffect(() => {
    if (!crowdGainRef.current || !audioCtxRef.current) return;
    if (crowdOn) {
      // Synthesise a crowd roar with white noise shaped by a lowpass filter
      if (!crowdAudioRef.current) {
        const ctx = audioCtxRef.current;
        const bufLen = ctx.sampleRate * 4;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 800;
        noise.connect(lp);
        lp.connect(crowdGainRef.current);
        noise.start();
        // store a fake audio ref so we know it's running
        crowdAudioRef.current = new Audio();
      }
      crowdGainRef.current.gain.value = 0.35;
    } else {
      crowdGainRef.current.gain.value = 0;
    }
  }, [crowdOn]);

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
          body: JSON.stringify({ driverName, team, persona, mp3Url: songUrl, grandPrix, celebration, voiceId: commentaryVoiceRef.current }),
          signal: controller.signal,
        });
        if (!res.ok) { setShareErrored(true); return; }
        const { code } = (await res.json()) as { code: string };
        if (typeof window !== "undefined") {
          const url = `${window.location.origin}/f1/result/${code}`;
          setShareUrl(url);
          onShareReady?.(url);
        }
      } catch {
        setShareErrored(true);
      }
    })();
    return () => controller.abort();
  }, [driverName, team, persona, songUrl, sharedView]);

  // ── Shared / phone view ──────────────────────────────────────────────────
  if (sharedView) {
    return <SharedPhoneView songUrl={songUrl} commentaryUrl={commentaryUrl} videoUrl={videoUrl} driverName={driverName} onTrackPlay={trackPlay} />;
  }

  // ── Kiosk view — Mixer screen ────────────────────────────────────────────────
  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #022AC0 35%, #066AFE 68%, #00B3FF 100%)" }}
    >
      {/* Lottie confetti burst on reveal */}
      <AnimatePresence>
        {showConfetti && confettiData && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Lottie animationData={confettiData} loop={false} style={{ width: "100%", height: "100%" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Champagne spray */}
      {/* ChampagneCanvas removed */}

      <div className="relative z-10 flex flex-1 flex-col items-center overflow-hidden px-10 pb-2">

        {/* Logo */}
        <motion.div
          className="flex flex-col items-center pt-12 shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LogoHeader className="justify-center" />
        </motion.div>

        {/* Waveform visualizer — overflow:visible so record isn't clipped */}
        <motion.div
          className="mt-4 shrink-0"
          style={{ width: "72%", height: 420, overflow: "visible", position: "relative", zIndex: 2 }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <AudioReactiveStreaks audioElement={kioskAudioEl} analyserNode={kioskAnalyser} reverbWet={reverbWet} />
        </motion.div>

        {/* Title — below visualizer */}
        <motion.h1
          className="mt-6 text-center font-extrabold leading-tight text-white shrink-0"
          style={{ fontSize: 80, fontFamily: "var(--font-avant-garde)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Take your track home{driverName ? `, ${driverName}.` : "."}
        </motion.h1>

        {/* FX buttons */}
        <motion.div
          className="mt-8 flex gap-6 shrink-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          {[
            { label: "DRS Reverb",      active: reverbWet > 0,  onToggle: () => setReverbWet(v => v > 0 ? 0 : 0.6) },
            { label: "Pit Lane Radio",  active: pitRadioOn,     onToggle: () => setPitRadioOn(v => !v) },
            { label: "Crowd Roar",      active: crowdOn,        onToggle: () => setCrowdOn(v => !v) },
          ].map(({ label, active, onToggle }) => (
            <button
              key={label}
              onClick={onToggle}
              style={{
                padding: "18px 40px",
                borderRadius: 999,
                border: active ? "none" : "3px solid rgba(255,255,255,0.5)",
                background: active
                  ? "linear-gradient(135deg, #9b6dff 0%, #e8608a 100%)"
                  : "rgba(255,255,255,0.08)",
                color: "white",
                fontFamily: "var(--font-avant-garde)",
                fontWeight: 700,
                fontSize: 32,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Reverb slider — always visible */}
        <motion.div
          className="mt-6 w-full shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <ReverbSlider value={reverbWet} onChange={setReverbWet} />
        </motion.div>

        {/* CTA hint */}
        <motion.p
          className="mt-6 text-center text-white/70 shrink-0"
          style={{ fontSize: 36, paddingLeft: 300, paddingRight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Use the controller to add your finishing touch
        </motion.p>

      </div>

      {/* Ready to share — bottom CTA */}
      <motion.div
        className="relative z-20 shrink-0 flex justify-center pb-10 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/f1/Buttons/ready-to-share.png"
          alt="Ready to share?"
          style={{ width: "min(480px, 60%)", height: "auto", cursor: "pointer" }}
          onClick={() => {
            if (kioskCommentaryRef.current) kioskCommentaryRef.current.pause();
            onNext?.();
          }}
        />
      </motion.div>
    </div>
  );
}

// ── QR Screen (step 9) ────────────────────────────────────────────────────────

interface QRScreenProps {
  driverName: string;
  shareUrl: string | null;
  onStartOver: () => void;
}

export function QRScreen({ driverName, shareUrl, onStartOver }: QRScreenProps) {
  const QR_SIZE = 220;

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #022AC0 35%, #066AFE 68%, #00B3FF 100%)" }}
    >
      <div className="relative z-10 flex flex-1 flex-col items-center px-10 overflow-hidden">

        {/* F1 + Salesforce logo */}
        <motion.div
          className="flex flex-col items-center pt-10 shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/F1 Salesforce Logo.png" alt="F1 × Salesforce" style={{ width: 520, height: "auto" }} />
          <p className="mt-2 text-white/70" style={{ fontSize: 28 }}>Global Partner of Formula 1®</p>
        </motion.div>

        {/* Track Star heading */}
        <motion.div
          className="mt-4 text-center shrink-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <h1 className="font-extrabold text-white leading-none" style={{ fontSize: 160, fontFamily: "var(--font-avant-garde)" }}>
            Track Star
          </h1>
          <p className="font-bold text-white" style={{ fontSize: 44 }}>
            Produced at Cannes 2026 on Salesforce Beach.
          </p>
        </motion.div>

        {/* QR code with visualizer behind it */}
        <motion.div
          className="relative mt-6 shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Visualizer bleeds behind the QR — absolutely centered */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
            <div style={{ width: "280%", position: "absolute" }}>
              <AudioReactiveStreaks />
            </div>
          </div>
          <div className="relative rounded-2xl bg-white shadow-2xl" style={{ padding: 14, zIndex: 1 }}>
            {shareUrl ? (
              <QRCodeSVG value={shareUrl} size={QR_SIZE} bgColor="#FFFFFF" fgColor="#000000" level="M" />
            ) : (
              <div className="animate-pulse rounded-2xl bg-gray-100" style={{ width: QR_SIZE, height: QR_SIZE }} />
            )}
          </div>
        </motion.div>

        {/* Scan CTA */}
        <motion.p
          className="mt-4 text-center text-white shrink-0"
          style={{ fontSize: 34 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Scan the QR code to download your F1® track and visualizer.
        </motion.p>

        {/* Name + anthem */}
        <motion.div
          className="mt-4 text-center shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p className="font-extrabold text-white leading-tight" style={{ fontSize: 68, fontFamily: "var(--font-avant-garde)" }}>
            {driverName ? `${driverName}, ` : ""}this is your podium anthem.
          </p>
          <p className="mt-3 text-white/80" style={{ fontSize: 32 }}>
            Agentforce used real-time data to shape your track. It&apos;s just one of the ways<br />
            Salesforce shapes incredible customer experiences.
          </p>
          <p className="mt-2 text-white/80" style={{ fontSize: 32 }}>
            Learn more at www.agentforce.com
          </p>
        </motion.div>

      </div>

      {/* Restart */}
      <motion.div
        className="relative z-20 shrink-0 px-10 pb-6 pt-4 flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/f1/Buttons/restart.png"
          alt="Restart"
          style={{ width: 320, height: "auto", cursor: "pointer" }}
          onClick={onStartOver}
        />
      </motion.div>

      {/* Legal */}
      <p className="relative z-10 shrink-0 text-center text-white/40 pb-1 px-10" style={{ fontSize: 18 }}>
        Music Tracks by Tom Baird
      </p>
      <p className="relative z-10 shrink-0 text-center text-white/40 pb-4 px-10" style={{ fontSize: 18 }}>
        The F1 logo, FORMULA 1, F1, GRAND PRIX and related marks are trademarks of Formula One Licensing BV,<br />a Formula 1 company. All rights reserved.
      </p>
    </div>
  );
}

// Thumb positioned so its centre tracks value fraction across the usable rail
function ThumbImage({ value, thumbW, trackRef, barRef }: { value: number; thumbW: number; trackRef: React.RefObject<HTMLDivElement | null>; barRef: React.RefObject<HTMLImageElement | null> }) {
  const trackW = trackRef.current?.offsetWidth ?? 900;
  const barH = barRef.current?.offsetHeight ?? 40;
  const thumbH = barH * 2.5;
  const leftPx = value * (trackW - thumbW);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/controller/Slider.png"
      alt=""
      draggable={false}
      className="pointer-events-none absolute"
      style={{
        top: "50%",
        left: leftPx,
        transform: "translateY(-50%)",
        width: thumbW,
        height: thumbH,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
      }}
    />
  );
}

// ── Reverb slider using controller assets ─────────────────────────────────────

function ReverbSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);

  const pctFromPointer = (clientX: number) => {
    if (!trackRef.current) return value;
    const { left, width } = trackRef.current.getBoundingClientRect();
    // Offset by half-thumb so thumb centre tracks finger
    const THUMB_W = 188;
    return Math.max(0, Math.min(1, (clientX - left - THUMB_W / 2) / (width - THUMB_W)));
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

  // Thumb travels from 0% to (100% - thumbWidth) across the track
  const THUMB_W = 188;

  return (
    <div
      ref={trackRef}
      className="relative touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ width: "100%", height: 152  }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Blue background rail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={barRef}
        src="/controller/Controller Background.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-x-0"
        style={{ top: "50%", transform: "translateY(-50%)", width: "100%", height: "auto" }}
      />

      {/* White fill rail — clipped to thumb position */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{
          width: `${value * 100}%`,
          overflow: "hidden",
          top: "50%",
          transform: "translateY(-50%)",
          height: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/controller/Controller White.png"
          alt=""
          draggable={false}
          style={{ width: trackRef.current ? trackRef.current.offsetWidth : "100vw", maxWidth: "none", height: "auto" }}
        />
      </div>

      {/* Slider thumb image — left% = value × (trackWidth - thumbWidth) / trackWidth */}
      <ThumbImage value={value} thumbW={THUMB_W} trackRef={trackRef} barRef={barRef} />
    </div>
  );
}

// ── Shared phone view ────────────────────────────────────────────────────────

function SharedPhoneView({
  songUrl,
  commentaryUrl,
  videoUrl,
  driverName,
  onTrackPlay,
}: {
  songUrl: string | null;
  commentaryUrl: string | null;
  videoUrl: string | null;
  driverName: string;
  onTrackPlay: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [videoDownloading, setVideoDownloading] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const [reverbWet, setReverbWet] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const commentaryRef = useRef<HTMLAudioElement | null>(null);
  const reverbWetRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);

  const togglePlay = useCallback(() => {
    if (!songUrl) return;
    if (!audioRef.current) {
      const a = new Audio(songUrl);
      a.crossOrigin = "anonymous";
      a.onended = () => {
        setPlaying(false);
        commentaryRef.current?.pause();
      };
      audioRef.current = a;
      setAudioEl(a);

      // Preload commentary
      if (commentaryUrl) {
        const c = new Audio(commentaryUrl);
        c.volume = 1;
        commentaryRef.current = c;
      }

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
      commentaryRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
        onTrackPlay();
        commentaryRef.current?.play().catch(() => {});
      }).catch(() => {});
    }
  }, [songUrl, commentaryUrl, playing, onTrackPlay]);

  // Sync reverb on phone view
  useEffect(() => {
    if (!reverbWetRef.current || !reverbDryRef.current) return;
    reverbWetRef.current.gain.value = reverbWet;
    reverbDryRef.current.gain.value = 1 - reverbWet * 0.6;
  }, [reverbWet]);

  const handleDownloadVideo = useCallback(async () => {
    if (!videoUrl || videoDownloading) return;
    setVideoDownloading(true);
    const slug = (driverName || "my").toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `${slug}-anthem.mp4`, { type: "video/mp4" });

      // iOS Safari: navigator.share opens native share sheet → "Save Video" → Camera Roll
      if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `${driverName}'s F1® Anthem`,
        });
      } else {
        // Android / desktop fallback — direct download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug}-anthem.mp4`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // User cancelled share sheet — not an error
      if (e instanceof Error && e.name !== "AbortError") {
        console.error("Video download failed:", e);
      }
    } finally {
      setVideoDownloading(false);
    }
  }, [videoUrl, driverName, videoDownloading]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: "linear-gradient(180deg, #022AC0 35%, #066AFE 68%, #00B3FF 100%)" }}
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

        {/* Save video */}
        {videoUrl ? (
          <div className="w-full flex flex-col items-center gap-2">
            <button
              onClick={handleDownloadVideo}
              disabled={videoDownloading}
              className="flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              {videoDownloading ? "Fetching…" : "↓ Save to Camera Roll"}
            </button>
            <p className="text-xs text-white/50">Music Tracks by Tom Baird</p>
          </div>
        ) : (
          <p className="text-xs text-white/40 animate-pulse">Preparing your video…</p>
        )}
      </motion.div>
    </div>
  );
}

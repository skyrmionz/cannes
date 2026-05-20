"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface Props {
  audioElement?: HTMLAudioElement | null;
  // When the parent owns the audio graph, pass the AnalyserNode directly.
  // The component will NOT create its own AudioContext in that case.
  analyserNode?: AnalyserNode | null;
}

const COUNT = 20;
const BASE = Array.from({ length: COUNT }, (_, i) => ({
  x: 5 + i * 4.8,
  delay: i * 0.08,
  h: 40 + ((i * 37) % 50),
  op: 0.08 + ((i * 13) % 20) / 100,
}));
const MAX_PULSE = 35;

export function AudioReactiveStreaks({ audioElement, analyserNode }: Props) {
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    function startRaf(analyser: AnalyserNode) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      function tick() {
        analyser.getByteFrequencyData(data);
        linesRef.current.forEach((el, i) => {
          if (!el) return;
          const bin = Math.min(Math.floor((i / COUNT) * data.length), data.length - 1);
          const v = data[bin] / 255;
          const s = BASE[i];
          el.style.height = `${s.h + v * MAX_PULSE}%`;
          el.style.opacity = String(Math.min(s.op + v * 0.4, 0.85));
        });
        rafRef.current = requestAnimationFrame(tick);
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    function stopRaf() {
      cancelAnimationFrame(rafRef.current);
      linesRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.height = `${BASE[i].h}%`;
        el.style.opacity = "";
      });
    }

    // ── Path A: parent owns the audio graph, pass analyser directly ──────────
    if (analyserNode) {
      const onPlay = () => startRaf(analyserNode);
      const onPause = () => stopRaf();
      const onEnded = () => stopRaf();

      if (audioElement) {
        audioElement.addEventListener("play", onPlay);
        audioElement.addEventListener("pause", onPause);
        audioElement.addEventListener("ended", onEnded);
        if (!audioElement.paused) startRaf(analyserNode);
      } else {
        // No element to listen to — just run continuously (reads zeros when silent)
        startRaf(analyserNode);
      }

      return () => {
        stopRaf();
        if (audioElement) {
          audioElement.removeEventListener("play", onPlay);
          audioElement.removeEventListener("pause", onPause);
          audioElement.removeEventListener("ended", onEnded);
        }
      };
    }

    // ── Path B: no external graph — create AudioContext from audioElement ─────
    if (!audioElement) return;

    const CtxCls =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!CtxCls) return;

    let ctx: AudioContext;
    let analyser: AnalyserNode;
    let data: Uint8Array;

    try {
      ctx = new CtxCls();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      data = new Uint8Array(analyser.frequencyBinCount);
      const source = ctx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {
      return;
    }

    const onPlay = () => {
      ctx.resume().catch(() => {});
      startRaf(analyser);
    };
    const onPause = () => stopRaf();
    const onEnded = () => stopRaf();

    audioElement.addEventListener("play", onPlay);
    audioElement.addEventListener("pause", onPause);
    audioElement.addEventListener("ended", onEnded);
    if (!audioElement.paused) onPlay();

    void data; // used inside startRaf via closure over analyser

    return () => {
      stopRaf();
      audioElement.removeEventListener("play", onPlay);
      audioElement.removeEventListener("pause", onPause);
      audioElement.removeEventListener("ended", onEnded);
      ctx.close().catch(() => {});
    };
  }, [audioElement, analyserNode]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BASE.map((s, i) => (
        <motion.div
          key={i}
          ref={(el) => {
            linesRef.current[i] = el as HTMLDivElement | null;
          }}
          className="absolute bottom-0 w-[1.5px] rounded-full bg-white"
          style={{ left: `${s.x}%`, height: `${s.h}%`, opacity: s.op }}
          animate={{ opacity: [s.op, s.op * 3, s.op] }}
          transition={{
            delay: s.delay,
            duration: 2 + (i % 3),
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

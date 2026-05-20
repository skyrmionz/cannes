"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseDrsReverbReturn {
  wetDry: number;           // 0–1, controlled by slider
  setWetDry: (v: number) => void;
  ready: boolean;
}

/**
 * Builds a Web Audio dry/wet reverb graph around an existing HTMLAudioElement.
 * The caller passes the audio element ref; this hook wires up the ConvolverNode
 * and exposes a wetDry setter (0 = fully dry, 1 = max wet).
 *
 *   dryGain  = 1 - (wet * 0.7)   — never fully removes dry signal
 *   wetGain  = wet * 0.9
 */
export function useDrsReverb(
  audioRef: React.RefObject<HTMLAudioElement | null>
): UseDrsReverbReturn {
  const [wetDry, setWetDryState] = useState(0.2);
  const [ready, setReady] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const irLoadedRef = useRef(false);
  const sourceConnectedRef = useRef(false);

  // Build the audio graph once the audio element exists and user interacts.
  const ensureGraph = useCallback(async () => {
    if (sourceConnectedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const convolver = ctx.createConvolver();

    dryGainRef.current = dryGain;
    wetGainRef.current = wetGain;

    // Apply initial wet value
    const w = 0.2;
    dryGain.gain.value = 1 - w * 0.7;
    wetGain.gain.value = w * 0.9;

    source.connect(dryGain);
    source.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);
    sourceConnectedRef.current = true;

    // Fetch IR — fail silently so reverb just doesn't work
    if (!irLoadedRef.current) {
      irLoadedRef.current = true;
      try {
        const res = await fetch("/audio/ir-stadium.wav");
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          convolver.buffer = decoded;
          setReady(true);
        }
      } catch {
        // reverb won't work but audio plays fine
      }
    }
  }, [audioRef]);

  // Wire up on mount — listens for the first play event to create AudioContext
  // (browsers require a user gesture before AudioContext can be created/resumed).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => { ensureGraph(); };
    audio.addEventListener("play", onPlay, { once: true });
    // If already playing when hook mounts:
    if (!audio.paused) ensureGraph();

    return () => audio.removeEventListener("play", onPlay);
  }, [audioRef, ensureGraph]);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const setWetDry = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setWetDryState(clamped);
    if (dryGainRef.current) {
      dryGainRef.current.gain.setTargetAtTime(1 - clamped * 0.7, ctxRef.current!.currentTime, 0.02);
    }
    if (wetGainRef.current) {
      wetGainRef.current.gain.setTargetAtTime(clamped * 0.9, ctxRef.current!.currentTime, 0.02);
    }
  }, []);

  return { wetDry, setWetDry, ready };
}

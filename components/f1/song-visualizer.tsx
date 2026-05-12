"use client";

/**
 * Audio-reactive p5-style canvas visualizer.
 *
 * Works in two modes:
 *   - live: runs in real time, driven by Web Audio AnalyserNode
 *   - offline: driven by pre-computed frequency frames, used during MP4 export
 *
 * The visual is a ring of radial bars (like a vinyl groove) that pulse with
 * the frequency spectrum. Color palette rotates slowly — seeded by teamId so
 * each team gets a distinct hue family.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface VisualizerHandle {
  /** Draw one frame at time t (seconds) using pre-analysed freq data. */
  drawFrame(t: number, freqData: Uint8Array): void;
  canvas: HTMLCanvasElement | null;
}

interface SongVisualizerProps {
  teamId: string;
  driverName: string;
  /** Live audio source — null during offline export. */
  analyser?: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
}

const TEAM_HUE: Record<string, number> = {
  "red-bull":    0,    // red
  "ferrari":     8,    // crimson-orange
  "mclaren":     28,   // papaya
  "mercedes":    168,  // teal
  "haas":        220,  // steel blue
  "racing-bulls": 200,
  "alpine":      240,
  "williams":    210,
  "audi":        50,
  "aston-martin":140,
  "cadillac":    30,
};

function getHue(teamId: string) {
  return TEAM_HUE[teamId] ?? 0;
}

function drawVisualizerFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freqData: Uint8Array,
  t: number,
  baseHue: number,
  driverName: string,
) {
  const cx = w / 2;
  const cy = h / 2;
  const bars = freqData.length;
  const innerR = Math.min(w, h) * 0.22;
  const maxBarH = Math.min(w, h) * 0.28;

  // Background — slow radial gradient that rotates hue
  const hueShift = (baseHue + t * 12) % 360;
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
  bg.addColorStop(0, `hsl(${hueShift}, 80%, 8%)`);
  bg.addColorStop(1, `hsl(${(hueShift + 40) % 360}, 60%, 3%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Radial bars
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
    const norm = freqData[i] / 255;
    const barH = norm * maxBarH + 2;
    const hue = (hueShift + (i / bars) * 60) % 360;
    const alpha = 0.6 + norm * 0.4;

    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * (innerR + barH);
    const y2 = cy + Math.sin(angle) * (innerR + barH);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${hue}, 100%, ${50 + norm * 30}%, ${alpha})`;
    ctx.lineWidth = Math.max(1.5, (w / bars) * 0.8);
    ctx.stroke();
  }

  // Inner glow circle
  const glowR = innerR * (0.85 + (freqData[2] / 255) * 0.15);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, `hsla(${hueShift}, 100%, 80%, 0.25)`);
  glow.addColorStop(1, `hsla(${hueShift}, 100%, 50%, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  // F1 red accent ring
  ctx.beginPath();
  ctx.arc(cx, cy, innerR - 4, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(225, 6, 0, ${0.4 + (freqData[0] / 255) * 0.5})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Driver name — bottom centre
  ctx.save();
  ctx.font = `bold ${Math.round(w * 0.035)}px "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.15em";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(driverName.toUpperCase(), cx, h - h * 0.07);
  ctx.restore();
}

export const SongVisualizer = forwardRef<VisualizerHandle, SongVisualizerProps>(
  function SongVisualizer(
    { teamId, driverName, analyser, width = 540, height = 540, className },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const baseHue = getHue(teamId);

    // Expose imperative handle for offline export
    useImperativeHandle(ref, () => ({
      drawFrame(t: number, freqData: Uint8Array) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawVisualizerFrame(ctx, canvas.width, canvas.height, freqData, t, baseHue, driverName);
      },
      get canvas() { return canvasRef.current; },
    }));

    // Live animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !analyser) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const startTime = performance.now();

      function tick() {
        analyser!.getByteFrequencyData(freqData);
        const t = (performance.now() - startTime) / 1000;
        drawVisualizerFrame(ctx!, canvas!.width, canvas!.height, freqData, t, baseHue, driverName);
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [analyser, baseHue, driverName]);

    // Static placeholder when no analyser yet
    useEffect(() => {
      if (analyser) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const freqData = new Uint8Array(128).fill(60);
      drawVisualizerFrame(ctx, canvas.width, canvas.height, freqData, 0, baseHue, driverName);
    }, [analyser, baseHue, driverName]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ imageRendering: "pixelated" }}
      />
    );
  },
);

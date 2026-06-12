"use client";

import { useEffect, useRef } from "react";

const LINE_COUNT = 44;

// Shared drawing function — used by both the live component and video generation
const REF_WIDTH = 390; // fixed reference width — bars always look like mobile

export function drawSinWaveFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number, // seconds elapsed
) {
  const spacing = REF_WIDTH / (LINE_COUNT + 1);
  const totalWidth = spacing * (LINE_COUNT + 1);
  const offsetX = (W - totalWidth) / 2;

  for (let i = 0; i < LINE_COUNT; i++) {
    const nx = i / (LINE_COUNT - 1); // 0 → 1
    const x = offsetX + spacing * (i + 1);

    // Height profile: central arch + two flanking satellite clusters matching reference image
    const arch = Math.sin(Math.PI * nx);
    const leftBump = 0.55 * Math.exp(-40 * Math.pow(nx - 0.1, 2));
    const rightBump = 0.55 * Math.exp(-40 * Math.pow(nx - 0.9, 2));
    const profile = arch * 0.82 + leftBump + rightBump;

    // Animation: slow breathe + per-line ripple phase
    const breathe = 0.88 + 0.12 * Math.sin(t * 0.7);
    const ripple = 0.08 * Math.sin(t * 1.6 + nx * Math.PI * 4);
    const hr = Math.max(0.015, profile * breathe + ripple);
    const lineH = hr * H * 0.86;

    const bright = Math.min(hr / 1.2, 1);

    ctx.shadowColor = `rgba(0, 220, 230, ${0.45 + bright * 0.45})`;
    ctx.shadowBlur = 6 + bright * 14;

    const grad = ctx.createLinearGradient(x, H, x, H - lineH);
    grad.addColorStop(0, "rgba(0, 150, 220, 0.15)");
    grad.addColorStop(0.35, `rgba(0, ${Math.round(195 + bright * 60)}, 225, 0.75)`);
    grad.addColorStop(0.8, `rgba(${Math.round(bright * 80)}, ${Math.round(220 + bright * 35)}, 235, 0.95)`);
    grad.addColorStop(1, `rgba(${Math.round(100 + bright * 155)}, 255, 248, 1)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5 + bright * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x, H - lineH);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

export function SinWaveLinesBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = canvas;
    const x = ctx;

    let rafId = 0;
    let startTime: number | null = null;

    function resize() {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(c);

    function tick(now: number) {
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000;
      x.clearRect(0, 0, c.width, c.height);
      drawSinWaveFrame(x, c.width, c.height, t);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}

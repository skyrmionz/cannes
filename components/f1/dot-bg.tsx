"use client";

import { useEffect, useRef } from "react";

// Animated mesh overlay on top of the F1 Formula 1 Gradient from Figma:
// #022AC0 at 35% → #066AFE at 68% → #00B3FF at 100%, linear top-to-bottom.
export const F1_GRADIENT = "linear-gradient(180deg, #022AC0 35%, #066AFE 68%, #00B3FF 100%)";

// Vertical glowing bars whose heights follow a sine wave that scrolls over time —
// matching the turquoise audio-visualiser reference image.
function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);

      const BAR_COUNT  = 28;           // number of vertical bars
      const BAR_W      = W * 0.012;    // bar width as fraction of screen
      const GAP        = (W - BAR_COUNT * BAR_W) / (BAR_COUNT + 1);
      const MAX_H      = H * 0.72;     // tallest bar reaches 72% of screen height
      const MIN_H      = H * 0.04;
      const BASE_Y     = H * 0.78;     // bars grow upward from this y

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = GAP + i * (BAR_W + GAP);

        // Each bar height is driven by two overlapping sine waves for organic movement
        const phase1 = (i / BAR_COUNT) * Math.PI * 2 - t * 1.1;
        const phase2 = (i / BAR_COUNT) * Math.PI * 4 - t * 0.7;
        const norm   = (Math.sin(phase1) * 0.65 + Math.sin(phase2) * 0.35 + 1) / 2; // 0..1
        const barH   = MIN_H + norm * (MAX_H - MIN_H);

        const x0 = x + BAR_W / 2;
        const y0 = BASE_Y;
        const y1 = BASE_Y - barH;

        // Glowing turquoise gradient — bright centre, fades at top and bottom
        const grad = ctx!.createLinearGradient(x0, y0, x0, y1);
        grad.addColorStop(0,    "rgba(0, 240, 220, 0.0)");
        grad.addColorStop(0.15, "rgba(0, 240, 200, 0.55)");
        grad.addColorStop(0.5,  "rgba(80, 255, 220, 0.95)");
        grad.addColorStop(0.85, "rgba(0, 240, 200, 0.55)");
        grad.addColorStop(1,    "rgba(0, 220, 255, 0.0)");

        ctx!.save();
        // Soft glow via shadow
        ctx!.shadowColor  = "rgba(0, 240, 200, 0.6)";
        ctx!.shadowBlur   = 18;
        ctx!.fillStyle    = grad;
        ctx!.beginPath();
        ctx!.roundRect(x, y1, BAR_W, barH, BAR_W / 2);
        ctx!.fill();
        ctx!.restore();
      }

      t += 0.018;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 1, opacity: 0.55 }}
    />
  );
}

export function DotBg({ wave = false }: { wave?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: F1_GRADIENT }}
    >
      {/* Blob 1 — top-left */}
      <div
        className="absolute rounded-full opacity-30"
        style={{
          width: "80vw",
          height: "80vw",
          top: "-20vw",
          left: "-20vw",
          background: "radial-gradient(circle at center, #066AFE 0%, transparent 70%)",
          animation: "moveInCircle 20s reverse infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 2 — bottom-right */}
      <div
        className="absolute rounded-full opacity-25"
        style={{
          width: "70vw",
          height: "70vw",
          bottom: "-15vw",
          right: "-15vw",
          background: "radial-gradient(circle at center, #00B3FF 0%, transparent 70%)",
          animation: "moveInCircle 40s linear infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 3 — center subtle */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: "60vw",
          height: "60vw",
          top: "20%",
          left: "20%",
          background: "radial-gradient(circle at center, #066AFE 0%, transparent 70%)",
          animation: "moveVertical 30s ease infinite",
          filter: "blur(80px)",
        }}
      />
      {wave && <WaveCanvas />}
    </div>
  );
}

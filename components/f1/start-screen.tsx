"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { DotBg, F1_GRADIENT } from "./dot-bg";

interface StartScreenProps {
  onStart: () => void;
}

const words = ["Are you", "Podium", "ready?"];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; decay: number;
      size: number;
    }

    const particles: Particle[] = [];
    // Launch phase starts at ~1.4s, car exits by ~2.2s
    // We spawn particles during that window based on elapsed time
    let elapsed = 0;
    let last = performance.now();

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnAt(cx: number, cy: number) {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 3 + Math.random() * 3,   // trail falls downward (car moves up)
          life: 1,
          decay: 0.8 + Math.random() * 0.8,
          size: 2 + Math.random() * 5,
        });
      }
    }

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      elapsed += dt;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn during launch window (1.4s–2.2s) at car exhaust position
      if (elapsed > 1.4 && elapsed < 2.4) {
        const progress = (elapsed - 1.4) / 0.8; // 0→1 during launch
        // Car top = 15% of screen, moves from there upward
        const carY = canvas!.height * (0.35 - progress * 0.55);
        spawnAt(canvas!.width / 2, carY + canvas!.height * 0.25);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${p.life * 0.6})`;
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
}

export function StartScreen({ onStart }: StartScreenProps) {
  // Timeline:
  // 0.1s  → car enters from bottom
  // 0.7s  → car settles behind headline
  // 1.4s  → headline + UI fully visible, car holds
  // 1.5s  → car launches off top
  // 2.2s  → car gone, particles fade

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden"
      style={{ background: F1_GRADIENT }}
      onClick={onStart}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <DotBg />
      <ParticleCanvas />

      {/* Corner stripes — start screen only */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 w-[45vw]">
        <Image src="/f1/stripe-top-left.png" alt="" width={785} height={842} unoptimized className="object-contain" />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-10 w-[45vw]">
        <Image src="/f1/stripe-bottom-right.png" alt="" width={785} height={842} unoptimized className="object-contain" />
      </div>

      {/* Header logos (F1 + Salesforce) */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex justify-center px-6 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Image
          src="/f1/header-logos.png"
          alt="F1 × Salesforce"
          width={690}
          height={210}
          priority
          className="h-auto w-[min(80vw,420px)] select-none"
        />
      </motion.div>

      {/* F1 Car — z-10 so headline text sits on top */}
      <motion.div
        className="absolute inset-x-0 z-10 flex justify-center"
        style={{ top: "12%" }}
        initial={{ y: "110%" }}
        animate={{ y: ["110%", "0%", "0%", "-130%"], scale: [0.9, 1, 1, 0.75] }}
        transition={{
          duration: 2.1,
          times: [0, 0.3, 0.68, 1],
          ease: "easeOut",
          delay: 0.1,
        }}
      >
        <Image
          src="/f1/f1-car-top.png"
          alt="F1 car"
          width={300}
          height={450}
          priority
          className="select-none"
          style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,80,0.5))" }}
        />
      </motion.div>

      {/* Content — z-20 so it sits above the car */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pointer-events-none">
        <div className="mb-6 flex flex-col items-center">
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="block text-center font-bold leading-none tracking-tight text-white"
              style={{ fontSize: "clamp(3rem, 16vw, 7rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          <Image
            src="/f1/powered-by-astro.png"
            alt="Powered by Agent Astro from Salesforce"
            width={1140}
            height={120}
            priority
            className="h-auto w-[min(80vw,360px)] select-none"
          />
        </motion.div>

        <StartEnginesButton onStart={onStart} />
      </div>

      {/* Trademark disclaimer */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.5 }}
      >
        <Image
          src="/f1/f1-trademark-disclaimer.png"
          alt="The F1 logo, FORMULA 1, F1, GRAND PRIX and related marks are trademarks of Formula One Licensing BV, a Formula 1 company. All rights reserved."
          width={1200}
          height={28}
          className="h-auto w-[min(94vw,720px)] select-none opacity-80"
        />
      </motion.div>
    </motion.div>
  );
}

function StartEnginesButton({ onStart }: { onStart: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onStart}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="group pointer-events-auto relative overflow-hidden rounded-full px-12 py-4 text-base font-bold tracking-tight text-[#001050] shadow-[0_12px_40px_rgba(2,42,192,0.45)] backdrop-blur-md transition-shadow duration-200 hover:shadow-[0_18px_60px_rgba(0,179,255,0.55)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(170,220,255,0.95) 0%, rgba(86,170,255,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
      }}
    >
      {/* Inner glass highlight */}
      <span
        className="pointer-events-none absolute inset-x-2 top-[2px] h-1/2 rounded-full opacity-80"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Bottom inner glow */}
      <span
        className="pointer-events-none absolute inset-x-3 bottom-[2px] h-1/3 rounded-full opacity-60"
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Hover sheen — diagonal swipe */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.65) 50%, transparent 70%)",
        }}
      />
      <span className="relative z-10">Start your engines</span>
    </motion.button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { DotBg, F1_GRADIENT } from "./dot-bg";
import { LogoHeader, AstroAvatar } from "./logo-header";

interface StartScreenProps {
  onStart: () => void;
}

const words = ["ARE YOU", "PODIUM", "READY?"];

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

      {/* Logos */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
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
              className="block text-center font-bold uppercase leading-none tracking-tight text-white"
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
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <AstroAvatar className="mb-4 h-24 w-24" />
        </motion.div>

        <motion.p
          className="mb-8 text-center text-sm uppercase tracking-[0.25em] text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          Powered by Agent Astro from Salesforce
        </motion.p>

        <motion.button
          className="pointer-events-auto rounded-full bg-white px-10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#001050] shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          onClick={onStart}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="block"
          >
            Tap to start
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

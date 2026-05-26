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

      {/* Header logos (F1 + Salesforce) — image already includes "Global Partner of Formula 1®" */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex justify-center px-6 pt-7"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Image
          src="/f1/header-logos.png"
          alt="F1 × Salesforce — Global Partner of Formula 1"
          width={690}
          height={210}
          priority
          className="h-auto w-[min(48vw,220px)] select-none"
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
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-32 pt-32">
        <div className="flex flex-col items-center">
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="block text-center font-bold leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2.75rem, 13vw, 5.25rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mt-16"
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
            className="h-auto w-[min(80vw,320px)] select-none"
          />
        </motion.div>
      </div>

      {/* Button — pinned near the bottom, above the disclaimer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-6">
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="group pointer-events-auto relative isolate overflow-hidden rounded-full px-14 py-4 text-base font-semibold tracking-tight text-white"
      style={{
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        backdropFilter: "blur(22px) saturate(160%)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.18) 100%)",
        boxShadow: [
          "0 1px 0 rgba(255,255,255,0.55) inset",
          "0 -1px 0 rgba(255,255,255,0.18) inset",
          "0 0 0 1px rgba(255,255,255,0.35) inset",
          "0 12px 36px rgba(2,16,80,0.35)",
        ].join(", "),
      }}
    >
      {/* Top highlight — thin specular edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-[1px] h-[1px] rounded-full opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Bottom soft refraction glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -bottom-3 h-3 rounded-full opacity-70 blur-md"
        style={{
          background: "rgba(170,220,255,0.55)",
        }}
      />
      {/* Hover sheen — diagonal swipe */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-[900ms] ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
        }}
      />
      {/* Active press darken */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-150 group-active:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,16,80,0.18) 0%, rgba(0,16,80,0.06) 100%)",
        }}
      />
      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,16,80,0.35)]">
        Start your engines
      </span>
    </motion.button>
  );
}

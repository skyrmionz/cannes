"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimate } from "motion/react";
import Image from "next/image";
import { DotBg, F1_GRADIENT } from "./dot-bg";
import { LogoHeader } from "./logo-header";

interface StartScreenProps {
  onStart: () => void;
}

// Animated sine-wave lines top + bottom — matches reference background
function SineWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    function drawSineGroup(
      W: number, H: number,
      yBase: number,     // 0 = top edge, 1 = bottom edge
      flip: boolean,     // true = waves point inward from bottom
      amp: number,
    ) {
      const layers = [
        { color: "rgba(100,180,255,0.18)", freq: 1.6, phaseOff: 0,    ampMul: 1.0 },
        { color: "rgba(120,210,255,0.13)", freq: 1.8, phaseOff: 0.8,  ampMul: 0.75 },
        { color: "rgba(80,160,255,0.10)",  freq: 2.0, phaseOff: 1.5,  ampMul: 0.55 },
      ];

      for (const l of layers) {
        ctx!.beginPath();
        const baseY = flip ? H * (1 - yBase) : H * yBase;
        const dir = flip ? 1 : -1;

        ctx!.moveTo(0, baseY);
        for (let x = 0; x <= W; x += 2) {
          const wave = Math.sin((x / W) * Math.PI * 2 * l.freq + t * 0.8 + l.phaseOff);
          ctx!.lineTo(x, baseY + dir * Math.abs(wave) * amp * l.ampMul);
        }
        if (flip) {
          ctx!.lineTo(W, H); ctx!.lineTo(0, H);
        } else {
          ctx!.lineTo(W, 0); ctx!.lineTo(0, 0);
        }
        ctx!.closePath();
        ctx!.fillStyle = l.color;
        ctx!.fill();
      }
    }

    function frame() {
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, W, H);
      const amp = H * 0.12;
      drawSineGroup(W, H, 0, false, amp);   // top
      drawSineGroup(W, H, 0, true,  amp);   // bottom
      t += 0.025;
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}

const words = ["Track", "Star"];

type Phase = "entering" | "idle" | "revving" | "launching";

interface SmokeSpawner {
  spawnSmoke: (cx: number, cy: number) => void;  
  triggerLaunchTrail: () => void;
}

function ParticleCanvas({ spawnerRef }: { spawnerRef: React.MutableRefObject<SmokeSpawner | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const launchRef = useRef<{ active: boolean; elapsed: number }>({ active: false, elapsed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; decay: number; size: number; isSmoke: boolean;
    }
    const particles: Particle[] = [];
    let last = performance.now();

    function resize() { canvas!.width = canvas!.offsetWidth; canvas!.height = canvas!.offsetHeight; }
    resize();
    window.addEventListener("resize", resize);

    function spawnWhite(cx: number, cy: number) {
      for (let i = 0; i < 5; i++) {
        particles.push({ x: cx + (Math.random() - 0.5) * 20, y: cy + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5, vy: 3 + Math.random() * 3,
          life: 1, decay: 0.8 + Math.random() * 0.8, size: 2 + Math.random() * 5, isSmoke: false });
      }
    }

    function spawnSmokeBurst(cx: number, cy: number) {
      for (let i = 0; i < 16; i++) {
        const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.3;
        const speed = 0.6 + Math.random() * 2.8;
        particles.push({ x: cx + (Math.random() - 0.5) * 40, y: cy + (Math.random() - 0.5) * 16,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.35 + 0.6,
          life: 1, decay: 0.3 + Math.random() * 0.3, size: 12 + Math.random() * 22, isSmoke: true });
      }
    }

    spawnerRef.current = {
      spawnSmoke: (cx: number, cy: number) => {
        const rect = canvas.getBoundingClientRect();
        spawnSmokeBurst(cx - rect.left, cy - rect.top);
      },
      triggerLaunchTrail: () => { launchRef.current = { active: true, elapsed: 0 }; },
    };

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (launchRef.current.active) {
        launchRef.current.elapsed += dt;
        if (launchRef.current.elapsed < 0.7) {
          const progress = launchRef.current.elapsed / 0.7;
          const carY = canvas!.height * (0.38 - progress * 0.52);
          spawnWhite(canvas!.width / 2, carY + canvas!.height * 0.13);
        } else { launchRef.current.active = false; }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= dt * p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        if (p.isSmoke) {
          const g = Math.floor(200 + 55 * p.life);
          ctx!.fillStyle = `rgba(${g},${g},${g},${p.life * 0.5})`;
        } else { ctx!.fillStyle = `rgba(255,255,255,${p.life * 0.6})`; }
        ctx!.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [spawnerRef]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [phase, setPhase] = useState<Phase>("entering");
  const [carScope, animateCar] = useAnimate();
  const spawnerRef = useRef<SmokeSpawner | null>(null);
  const carContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carScope.current) return;
    animateCar(carScope.current, { y: [600, 0], scale: [0.88, 1] },
      { duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] })
      .then(() => setPhase("idle"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnExhaust = useCallback(() => {
    if (!carContainerRef.current) return;
    const rect = carContainerRef.current.getBoundingClientRect();
    spawnerRef.current?.spawnSmoke(rect.left + rect.width / 2, rect.bottom - rect.height * 0.06);
  }, []);

  const handleTap = useCallback(async () => {
    if (phase !== "idle") return;
    setPhase("revving");
    spawnExhaust();
    await animateCar(carScope.current,
      { x: [0, -12, 12, -9, 9, -6, 6, -3, 3, 0], rotate: [0, -3, 3, -2, 2, -1, 1, 0] },
      { duration: 0.5, ease: "easeOut" });
    spawnExhaust();
    setPhase("launching");
    spawnerRef.current?.triggerLaunchTrail();
    await animateCar(carScope.current, { y: -900, scale: 0.7, x: 0, rotate: 0 },
      { duration: 0.55, ease: [0.55, 0, 1, 0.45] });
    onStart();
  }, [phase, animateCar, carScope, spawnExhaust, onStart]);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: F1_GRADIENT }}
      onClick={handleTap}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <DotBg wave />
      <SineWaveBackground />
      <ParticleCanvas spawnerRef={spawnerRef} />

      {/* Logo header */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex flex-col items-center"
        style={{ paddingTop: 64 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Image
          src="/logos/F1 Salesforce Logo.png"
          alt="F1 x Salesforce"
          width={580}
          height={116}
          priority
          unoptimized
          className="object-contain"
        />
      </motion.div>

      {/* F1 Car — large, starts at 18% top */}
      <div
        ref={carContainerRef}
        className="absolute inset-x-0 flex justify-center"
        style={{ top: "18%", zIndex: 15 }}
      >
        <div ref={carScope} style={{ transform: "translateY(600px) scale(0.88)" }}>
          <Image
            src="/f1/F1 car.png"
            alt="F1 car"
            width={860}
            height={1290}
            priority
            className="select-none"
            style={{
              filter: "drop-shadow(0 16px 60px rgba(0,0,80,0.6))",
              width: 860,
              height: "auto",
            }}
          />
        </div>
      </div>

      {/* Headline + subheader — overlaid on car */}
      <div
        className="absolute inset-x-0 z-20 flex flex-col items-center pointer-events-none"
        style={{ top: "36%" }}
      >
        <div className="flex flex-col items-center" style={{ gap: 0 }}>
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="block text-center font-extrabold leading-none tracking-tight text-white"
              style={{ fontSize: 290 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="mt-4 text-center font-semibold text-white/80"
          style={{ fontSize: 48 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          Build your podium anthem.
        </motion.p>
      </div>

      {/* Powered by + CTA — anchored to bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom: 72 }}
      >
        {/* Powered by */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.5 }}
        >
          <Image
            src="/f1/screen1-poweredby.png"
            alt="Powered by Agentforce from Salesforce"
            width={680}
            height={60}
            unoptimized
            className="object-contain"
            style={{ width: "min(560px, 70vw)", height: "auto" }}
          />
        </motion.div>

        {/* CTA button */}
        <motion.button
          className="pointer-events-auto"
          style={{ background: "none", border: "none", padding: 0 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          onClick={(e) => { e.stopPropagation(); handleTap(); }}
        >
          <motion.div
            animate={phase === "idle" ? { opacity: [0.85, 1, 0.85] } : { opacity: 1 }}
            transition={{ duration: 2, repeat: phase === "idle" ? Infinity : 0, ease: "easeInOut" }}
          >
            <Image
              src="/f1/Buttons/Start your engines Pil.png"
              alt="Start your engines"
              width={880}
              height={108}
              unoptimized
              className="object-contain"
              style={{ width: "min(600px, 78vw)", height: "auto" }}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* Trademark — pinned to bottom */}
      <motion.div
        className="absolute bottom-3 left-0 right-0 z-20 flex justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
      >
        <Image
          src="/f1/trademark.png"
          alt=""
          width={892}
          height={13}
          unoptimized
          className="object-contain opacity-60"
          style={{ width: 960 }}
        />
      </motion.div>
    </motion.div>
  );
}

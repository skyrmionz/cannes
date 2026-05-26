"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { DotBg, F1_GRADIENT } from "./dot-bg";

interface StartScreenProps {
  onStart: () => void;
}

const words = ["Are you", "podium", "ready?"];

// Launch sequence (after button click):
//   t=0–300ms     UI fades out
//   t=300–700ms   Car revs in place
//   t=700–1400ms  Car shoots off top with particle trail
//   t=1400ms      Parent navigates to next screen
const LAUNCH_TOTAL_MS = 1400;

function ParticleCanvas({ launchAt }: { launchAt: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const launchAtRef = useRef<number | null>(launchAt);

  useEffect(() => {
    launchAtRef.current = launchAt;
  }, [launchAt]);

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
          vy: 3 + Math.random() * 3,
          life: 1,
          decay: 0.8 + Math.random() * 0.8,
          size: 2 + Math.random() * 5,
        });
      }
    }

    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn particles only during the launch window
      const trigger = launchAtRef.current;
      if (trigger !== null) {
        const since = (now - trigger) / 1000; // seconds since click
        // Launch motion runs from 0.7s..1.4s after click
        if (since >= 0.7 && since < 1.4) {
          const launchProgress = (since - 0.7) / 0.7; // 0..1 across launch
          // Car settles at top:12% with height ~450; exhaust at ~25% of height below top
          const carY = canvas!.height * (0.35 - launchProgress * 0.55);
          spawnAt(canvas!.width / 2, carY + canvas!.height * 0.25);
        }
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
  const [launching, setLaunching] = useState(false);
  const [launchAt, setLaunchAt] = useState<number | null>(null);

  const handleLaunchClick = () => {
    if (launching) return;
    setLaunching(true);
    setLaunchAt(performance.now());
    setTimeout(onStart, LAUNCH_TOTAL_MS);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: F1_GRADIENT }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <DotBg />
      <ParticleCanvas launchAt={launchAt} />

      {/* Corner stripes — start screen only */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-10 w-[45vw]"
        animate={launching ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Image src="/f1/stripe-top-left.png" alt="" width={785} height={842} unoptimized className="object-contain" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 z-10 w-[45vw]"
        animate={launching ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Image src="/f1/stripe-bottom-right.png" alt="" width={785} height={842} unoptimized className="object-contain" />
      </motion.div>

      {/* Header logos (F1 + Salesforce) */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex justify-center px-6 pt-7"
        initial={{ opacity: 0, y: -10 }}
        animate={
          launching
            ? { opacity: 0, y: -8 }
            : { opacity: 1, y: 0 }
        }
        transition={
          launching
            ? { duration: 0.3, ease: "easeOut" }
            : { delay: 0.2, duration: 0.5 }
        }
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
        initial={{ y: "110%", scale: 0.9 }}
        animate={
          launching
            ? { y: ["0%", "2%", "-130%"], scale: [1, 1.04, 0.75] }
            : { y: "0%", scale: 1 }
        }
        transition={
          launching
            ? { duration: 1.1, times: [0, 0.36, 1], ease: [0.32, 0.72, 0, 1], delay: 0.3 }
            : { duration: 0.7, ease: "easeOut", delay: 0.1 }
        }
      >
        <CarMedia rumble={!launching} />
      </motion.div>

      {/* Content — z-20 so it sits above the car */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-32 pt-32"
        animate={launching ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* Button — pinned near the bottom, above the disclaimer */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-6"
        animate={launching ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <StartEnginesButton onClick={handleLaunchClick} disabled={launching} />
      </motion.div>

      {/* Trademark disclaimer */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4"
        initial={{ opacity: 0 }}
        animate={launching ? { opacity: 0 } : { opacity: 1 }}
        transition={
          launching
            ? { duration: 0.3, ease: "easeOut" }
            : { delay: 1.7, duration: 0.5 }
        }
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

// Continuous engine-rumble jitter applied while the car is idle.
// Disabled during launch so launch motion isn't fought by the rumble loop.
const rumbleAnimate = {
  x: [0, -0.12, 0.1, -0.08, 0.12, -0.06, 0.1, 0],
  y: [0, 0.08, -0.1, 0.12, -0.08, 0.1, -0.1, 0],
  rotate: [0, -0.025, 0.03, -0.02, 0.025, -0.025, 0.02, 0],
};

const rumbleTransition = {
  duration: 0.55,
  repeat: Infinity,
  ease: "linear" as const,
};

// Renders the idle car. Tries the looping <video> first; if it fails to load
// (e.g. the asset hasn't been generated yet) falls back to the static PNG so
// the screen still works.
function CarMedia({ rumble }: { rumble: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false);

  const inner = videoFailed ? (
    <Image
      src="/f1/f1-car-top.png"
      alt="F1 car"
      width={300}
      height={450}
      priority
      className="select-none"
      style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,80,0.5))" }}
    />
  ) : (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onError={() => setVideoFailed(true)}
      className="select-none"
      style={{
        width: 300,
        height: "auto",
        filter: "drop-shadow(0 12px 40px rgba(0,0,80,0.5))",
      }}
    >
      {/* HEVC+alpha listed first — Safari picks it; Chrome/Firefox skip and use WebM */}
      <source src="/f1/f1-car-idle.mp4" type='video/mp4; codecs="hvc1"' />
      <source src="/f1/f1-car-idle.webm" type="video/webm" />
    </video>
  );

  return (
    <motion.div
      animate={rumble ? rumbleAnimate : { x: 0, y: 0, rotate: 0 }}
      transition={rumble ? rumbleTransition : { duration: 0.2 }}
      style={{ willChange: "transform" }}
    >
      {inner}
    </motion.div>
  );
}

function StartEnginesButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.4 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="group pointer-events-auto relative isolate overflow-hidden rounded-full px-14 py-4 text-base font-semibold tracking-tight text-white disabled:cursor-not-allowed"
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
        Start your engine
      </span>
    </motion.button>
  );
}

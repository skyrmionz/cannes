"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  type SunStop,
  type HydrationLevel,
  type AgendaIndex,
  getPersona,
  generateResultCode,
  encodeLorealResult,
} from "@/lib/loreal-personas";

interface Props {
  sunStop: SunStop;
  hydrationLevel: HydrationLevel;
  agendaIndex: AgendaIndex;
  onFinish: () => void;
}

export function LorealPersonaScreen({
  sunStop,
  hydrationLevel,
  agendaIndex,
  onFinish,
}: Props) {
  // QR code rendered as a fixed pixel size that scales with viewport.
  // Computed in an effect so we don't access `window` during render
  // (would mismatch the SSR pass and trigger a hydration warning).
  const [qrSize, setQrSize] = useState(280);
  useEffect(() => {
    const compute = () =>
      setQrSize(
        Math.round(
          Math.min(window.innerWidth * 0.62, window.innerHeight * 0.4, 360),
        ),
      );
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { qrUrl } = useMemo(() => {
    const p = getPersona(sunStop, hydrationLevel, agendaIndex);
    const code = generateResultCode();
    const encoded = encodeLorealResult({
      persona: p.name,
      description: p.description,
      sun: sunStop,
      hydration: hydrationLevel,
      agenda: agendaIndex,
      code,
    });
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return {
      qrUrl: `${origin}/loreal/result/${encoded}`,
    };
  }, [sunStop, hydrationLevel, agendaIndex]);

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-[40px] text-[#001050]">
      {/* Palm tree — anchored top-left, fronds reach top-right. The base
          stays still while the top sways slightly. transform-origin pinned
          to the bottom of the image so motion only shows up near the canopy. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-10 select-none"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          transformOrigin: "50% 100%",
        }}
        animate={{ rotate: [-0.9, 0.9, -0.9] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loreal/persona-palm.png"
          alt=""
          draggable={false}
          className="block h-auto w-full select-none"
        />
      </motion.div>

      {/* Tap-anywhere reset — large invisible button covers the whole card so
          a brand ambassador (or kiosk auto-reset) can advance without a CTA
          breaking the marketing comp. */}
      <button
        type="button"
        aria-label="Finish"
        onClick={onFinish}
        className="absolute inset-0 z-0 cursor-default"
        style={{ background: "transparent" }}
      />

      {/* Content stack */}
      <div className="relative z-20 flex h-full w-full flex-col items-center px-6 pb-8">
        {/* Spacer so the title clears the palm fronds and sits lower
            on the screen, like the start screen's headline. */}
        <div
          aria-hidden
          className="shrink-0"
          style={{ height: "clamp(11rem, 32vh, 22rem)" }}
        />

        <motion.h1
          className="shrink-0 text-center font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "min(10vw, 6vh)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        >
          Your personal
          <br />
          OOO status is
          <br />
          one step away
        </motion.h1>

        {/* QR + crab cluster — directly under the title, big */}
        <motion.div
          className="relative mt-6 flex shrink-0 flex-col items-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
        >
          {/* Crab — perched on top edge of the QR card, centered, upright */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loreal/crab.png"
            alt=""
            draggable={false}
            className="pointer-events-none relative z-10 select-none"
            style={{
              width: "clamp(80px, 18vw, 140px)",
              marginBottom: "clamp(-28px, -3.5vh, -20px)",
            }}
          />

          {/* QR card */}
          <div
            className="grid place-items-center rounded-[32px] bg-white"
            style={{
              padding: "clamp(16px, 3.5vw, 26px)",
              boxShadow: [
                "0 0 0 1px rgba(0,16,80,0.06)",
                "0 18px 40px rgba(120,160,220,0.22)",
              ].join(", "),
            }}
          >
            <QRCodeSVG
              value={qrUrl}
              size={qrSize}
              bgColor="#FFFFFF"
              fgColor="#001050"
              level="M"
            />
          </div>

          {/* Caption — directly under the QR */}
          <motion.p
            className="shrink-0 max-w-md text-center leading-snug text-[#001050]"
            style={{
              fontSize: "min(5.2vw, 2.8vh)",
              fontFamily:
                'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 500,
              marginTop: "clamp(1rem, 3vh, 2rem)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          >
            Scan this QR code and show it to our Brand Ambassadors to pick
            up your gift.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

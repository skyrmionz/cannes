"use client";

import { useMemo } from "react";
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
      <div className="relative z-20 flex h-full w-full flex-col items-center px-6 pt-6 pb-8">
        {/* Spacer so title clears the palm fronds */}
        <div
          aria-hidden
          className="shrink-0"
          style={{ height: "clamp(7rem, 22vh, 14rem)" }}
        />

        <motion.h1
          className="shrink-0 text-center font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(1.6rem, min(8vw, 5.5vh), 2.8rem)" }}
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

        {/* QR + crab cluster, vertically centered in the slack region */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <motion.div
            className="relative flex flex-col items-center"
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
                width: "clamp(60px, 14vw, 110px)",
                marginBottom: "clamp(-22px, -3vh, -16px)",
              }}
            />

            {/* QR card */}
            <div
              className="grid place-items-center rounded-[28px] bg-white"
              style={{
                padding: "clamp(14px, 3vw, 22px)",
                boxShadow: [
                  "0 0 0 1px rgba(0,16,80,0.06)",
                  "0 18px 40px rgba(120,160,220,0.22)",
                ].join(", "),
              }}
            >
              <QRCodeSVG
                value={qrUrl}
                size={220}
                bgColor="#FFFFFF"
                fgColor="#001050"
                level="M"
              />
            </div>
          </motion.div>
        </div>

        <motion.p
          className="shrink-0 max-w-md text-center leading-snug text-[#001050]"
          style={{
            fontSize: "clamp(1rem, min(4.2vw, 2.6vh), 1.3rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500,
            marginTop: "clamp(0.75rem, 2.5vh, 1.5rem)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          Scan this QR code and show it to our Brand Ambassadors to pick up
          your gift.
        </motion.p>
      </div>
    </div>
  );
}

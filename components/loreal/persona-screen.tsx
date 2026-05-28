"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { GlassyButton } from "./glassy-button";
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
  const { persona, qrUrl } = useMemo(() => {
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
      persona: p,
      qrUrl: `${origin}/loreal/result/${encoded}`,
    };
  }, [sunStop, hydrationLevel, agendaIndex]);

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-5 pt-5 pb-5 text-[#001050] sm:px-6 sm:pt-7 sm:pb-7">
      <motion.div
        className="shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          draggable={false}
          className="h-auto select-none"
          style={{ width: "min(38vw, 14vh)" }}
        />
      </motion.div>

      <motion.h1
        className="mt-4 text-center font-bold leading-[1.05] tracking-tight"
        style={{ fontSize: "clamp(1.25rem, min(6vw, 4.5vh), 2.6rem)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        Your persona is{" "}
        <span className="whitespace-nowrap">{persona.name}.</span>
      </motion.h1>

      <motion.p
        className="mt-2 w-full max-w-2xl text-center leading-snug text-[#001050]/80"
        style={{
          fontSize: "clamp(0.8rem, min(2.8vw, 1.9vh), 1.05rem)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
      >
        {persona.description}
      </motion.p>

      {/* Sunscreen tube hero — flex-1 absorbs slack and shrinks first on small screens. */}
      <motion.div
        className="relative my-2 flex min-h-0 flex-1 items-center justify-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
      >
        <Image
          src="/loreal/sunscreen-tube.png"
          alt="L'Oréal sunscreen"
          width={720}
          height={720}
          priority
          draggable={false}
          className="max-h-full select-none object-contain"
          style={{
            width: "min(52vw, 32vh)",
            filter: "drop-shadow(0 20px 40px rgba(60,120,240,0.22))",
          }}
        />
      </motion.div>

      {/* QR card — left message + QR live inside a single white container. */}
      <motion.div
        className="flex w-full max-w-xl shrink-0 items-center justify-between gap-4 rounded-3xl bg-white p-4"
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,16,80,0.08), 0 12px 30px rgba(120,160,220,0.22)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      >
        <p
          className="min-w-0 leading-snug text-[#001050]"
          style={{
            fontSize: "clamp(0.78rem, min(2.6vw, 1.8vh), 1rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500,
          }}
        >
          Scan this QR code and show it to one of our Brand Ambassadors for
          your L&rsquo;Oréal gift!
        </p>
        <div className="grid shrink-0 place-items-center">
          <QRCodeSVG
            value={qrUrl}
            size={104}
            bgColor="#FFFFFF"
            fgColor="#001050"
            level="M"
          />
        </div>
      </motion.div>

      <motion.div
        className="mt-4 shrink-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <GlassyButton onClick={onFinish} delay={0}>
          Finish Up
        </GlassyButton>
      </motion.div>
    </div>
  );
}

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

  const subtitleStyle = {
    fontSize: "clamp(0.8rem, min(2.8vw, 1.9vh), 1.05rem)",
    fontFamily:
      'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
  } as const;

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-5 pt-5 pb-10 text-[#001050] sm:px-6 sm:pt-7 sm:pb-14">
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

      {/* Top spacer — pushes the persona text away from the logo so the
          title + description sit closer to the icon. */}
      <div className="min-h-0 flex-1" />

      <motion.h1
        className="shrink-0 text-center font-bold leading-[1.05] tracking-tight"
        style={{ fontSize: "clamp(1.25rem, min(6vw, 4.5vh), 2.6rem)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        Your persona is{" "}
        <span className="whitespace-nowrap">{persona.name}.</span>
      </motion.h1>

      <motion.p
        className="mt-2 w-full max-w-2xl shrink-0 text-center leading-snug text-[#001050]/80"
        style={subtitleStyle}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
      >
        {persona.description}
      </motion.p>

      {/* Icon — anchored in the visual center via balanced flex-1 spacers. */}
      <motion.div
        className="relative mt-3 flex shrink-0 items-center justify-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/loreal/sunscreen-tube.png"
            alt="L'Oréal sunscreen"
            width={720}
            height={720}
            priority
            draggable={false}
            className="h-auto select-none"
            style={{
              width: "min(48vw, 28vh)",
              filter: "drop-shadow(0 20px 40px rgba(60,120,240,0.22))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* QR block — message on top, QR below, both centered. Same subtitle
          font formatting as the persona description above the icon. */}
      <motion.div
        className="mt-3 flex w-full max-w-md shrink-0 flex-col items-center text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      >
        <p
          className="leading-snug text-[#001050]/80"
          style={subtitleStyle}
        >
          Scan this QR code and show it to one of our Brand Ambassadors for
          your L&rsquo;Oréal gift!
        </p>
        <div className="mt-3 grid place-items-center rounded-2xl bg-white p-3">
          <QRCodeSVG
            value={qrUrl}
            size={144}
            bgColor="#FFFFFF"
            fgColor="#001050"
            level="M"
          />
        </div>
      </motion.div>

      {/* Bottom spacer — mirrors the top so the icon stays vertically centered. */}
      <div className="min-h-0 flex-1" />

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

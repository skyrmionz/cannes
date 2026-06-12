"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  type SunStop,
  type HydrationLevel,
  type AgendaIndex,
  getStatus,
  generateResultCode,
  encodeLorealResult,
} from "@/lib/loreal-personas";

interface Props {
  sunStop: SunStop;
  hydrationLevel: HydrationLevel;
  agendaIndex: AgendaIndex;
  onFinish: () => void;
}

const TITLE_GRADIENT =
  "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)";

const SYSTEM_FONT =
  'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export function LorealPersonaScreen({
  sunStop,
  hydrationLevel,
  agendaIndex,
  onFinish,
}: Props) {
  const [qrSize, setQrSize] = useState(200);
  useEffect(() => {
    const compute = () =>
      setQrSize(
        Math.round(
          Math.min(window.innerWidth * 0.42, window.innerHeight * 0.28, 240),
        ),
      );
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const status = useMemo(
    () => getStatus(sunStop, hydrationLevel, agendaIndex),
    [sunStop, hydrationLevel, agendaIndex],
  );

  const qrUrl = useMemo(() => {
    const code = generateResultCode();
    const encoded = encodeLorealResult({
      persona: status.title,
      description: status.description,
      sun: sunStop,
      hydration: hydrationLevel,
      agenda: agendaIndex,
      code,
    });
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/spf/${encoded}`;
  }, [status, sunStop, hydrationLevel, agendaIndex]);

  return (
    <div className="absolute inset-0 text-[#001050]">
      {/* Tap-anywhere reset */}
      <button
        type="button"
        aria-label="Finish"
        onClick={onFinish}
        className="absolute inset-0 z-0 cursor-default"
        style={{ background: "transparent" }}
      />

      {/* Content fades in smoothly like the other page transitions. */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          paddingTop: "clamp(1.5rem, 4vh, 2.5rem)",
          paddingBottom: "clamp(1.25rem, 3vh, 2rem)",
          paddingInline: "clamp(1.25rem, 4vw, 2rem)",
          gap: "clamp(0.25rem, 1vh, 0.75rem)",
        }}
      >
        {/* Salesforce Beach logo — tapping restarts the experience */}
        <button
          type="button"
          onClick={onFinish}
          aria-label="Restart"
          className="shrink-0"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Image
            src="/loreal/salesforce-beach-logo.png"
            alt="Salesforce Beach"
            width={1200}
            height={240}
            priority
            unoptimized
            draggable={false}
            className="h-auto select-none"
            style={{ width: "min(72vw, 38vh, 400px)" }}
          />
        </button>

        {/* Vibe name card — more padding inside to increase height,
            less frost (lower blur), more spacing from the logo above. */}
        <div
          className="flex w-full shrink-0 items-center rounded-[36px]"
          style={{
            paddingInline: "clamp(1.75rem, 5vw, 2.5rem)",
            paddingTop: "clamp(2.25rem, 6vh, 3.5rem)",
            paddingBottom: "clamp(2rem, 5vh, 3rem)",
            marginTop: "clamp(1.25rem, 3.5vh, 2.5rem)",
            gap: "clamp(0.75rem, 2vw, 1.25rem)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.3) 100%)",
            backdropFilter: "blur(8px) saturate(120%)",
            WebkitBackdropFilter: "blur(8px) saturate(120%)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.4) inset",
              "0 1px 0 rgba(255,255,255,0.6) inset",
              "0 12px 36px rgba(120,160,220,0.18)",
            ].join(", "),
          }}
        >
          <Image
            src="/loreal/sun-emoji.png"
            alt=""
            width={64}
            height={64}
            unoptimized
            draggable={false}
            className="shrink-0 select-none"
            style={{ width: "clamp(52px, 8vw, 80px)", height: "auto" }}
          />
          <div className="flex min-w-0 flex-col items-start">
            <span
              className="font-semibold leading-tight text-[#001050]/70"
              style={{
                fontSize: "clamp(1.5rem, min(6vw, 3.6vh), 2.2rem)",
                fontFamily: SYSTEM_FONT,
              }}
            >
              Your Cannes OOO vibe:
            </span>
            <h1
              className="font-bold leading-[1.05] tracking-tight"
              style={{
                fontSize: "clamp(2.4rem, min(10vw, 6.5vh), 4rem)",
                whiteSpace: "pre-line",
                backgroundImage: TITLE_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              {status.title}
            </h1>
          </div>
        </div>

        {/* Hero vibe image — slightly smaller than full, pushed up
            toward the card above so the description has room below
            without touching the QR container. */}
        <div
          className="flex min-h-0 w-full flex-1 items-start justify-center"
          style={{ marginTop: "clamp(-1rem, -2vh, -0.5rem)" }}
        >
          <Image
            src={status.image}
            alt={status.title}
            width={989}
            height={989}
            priority
            unoptimized
            draggable={false}
            className="mx-auto select-none"
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Description — center-aligned, pulled up into the image's
            bottom whitespace. Enough bottom margin to not touch the
            QR container below. */}
        <p
          className="w-full shrink-0 text-center text-[#001050]/90"
          style={{
            fontSize: "clamp(1.6rem, min(6.5vw, 3.8vh), 2.4rem)",
            fontFamily: SYSTEM_FONT,
            fontWeight: 400,
            whiteSpace: "pre-line",
            lineHeight: 1.35,
            marginTop: "clamp(-5rem, -8vh, -2rem)",
            marginBottom: "clamp(0.75rem, 2vh, 1.25rem)",
          }}
        >
          {status.description}
        </p>

        {/* QR area — white container, centered, holds QR + instruction */}
        <div
          className="flex shrink-0 flex-wrap items-center justify-center self-center rounded-[28px]"
          style={{
            padding: "clamp(1.5rem, 3.5vh, 2.5rem) clamp(1.5rem, 4vw, 2.5rem)",
            gap: "clamp(1rem, 3vw, 1.5rem)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: [
              "0 0 0 1px rgba(0,16,80,0.06) inset",
              "0 1px 0 rgba(255,255,255,0.95) inset",
              "0 6px 22px rgba(120,160,220,0.18)",
            ].join(", "),
          }}
        >
          <div className="shrink-0" style={{ width: "min(240px, 36vw)" }}>
            <QRCodeSVG
              value={qrUrl}
              size={qrSize}
              bgColor="transparent"
              fgColor="#001050"
              level="M"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <p
            className="flex-1 text-left leading-snug text-[#001050]"
            style={{
              fontSize: "clamp(1.6rem, min(6.5vw, 3.8vh), 2.4rem)",
              fontFamily: SYSTEM_FONT,
              fontWeight: 700,
              whiteSpace: "pre-line",
              minWidth: "min(200px, 40vw)",
            }}
          >
            {"Scan to take your vibe with you.\nClaim your SPF gift at the counter."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
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
    return `${origin}/loreal/result/${encoded}`;
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

      {/* Content sits directly against the screen — no outer glassy
          shell. Same inset-3 rounded shell used by question screens
          just for the card frame, but NO glass background on it. */}
      <div
        className="absolute inset-3 z-10 flex flex-col items-center overflow-hidden rounded-[40px]"
        style={{
          paddingTop: "clamp(1.5rem, 4vh, 2.5rem)",
          paddingBottom: "clamp(1.25rem, 3vh, 2rem)",
          paddingInline: "clamp(1.25rem, 4vw, 2rem)",
          gap: "clamp(0.5rem, 1.5vh, 1rem)",
        }}
      >
        {/* Salesforce Beach logo — larger */}
        <Image
          src="/loreal/salesforce-beach-logo.png"
          alt="Salesforce Beach"
          width={1200}
          height={240}
          priority
          unoptimized
          draggable={false}
          className="h-auto shrink-0 select-none"
          style={{ width: "min(72vw, 38vh, 400px)" }}
        />

        {/* Glassy header card — taller, more top padding to space
            away from the logo. Vibe name larger + left aligned. */}
        <div
          className="flex w-full shrink-0 items-center rounded-[36px]"
          style={{
            paddingInline: "clamp(1.5rem, 5vw, 2.5rem)",
            paddingTop: "clamp(1.75rem, 5vh, 3rem)",
            paddingBottom: "clamp(1.5rem, 4vh, 2.5rem)",
            marginTop: "clamp(0.5rem, 1.5vh, 1rem)",
            gap: "clamp(0.75rem, 2vw, 1.25rem)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.5) 100%)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.55) inset",
              "0 1px 0 rgba(255,255,255,0.85) inset",
              "0 12px 36px rgba(120,160,220,0.22)",
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
                fontSize: "clamp(1.3rem, min(5vw, 3vh), 1.8rem)",
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

        {/* Hero vibe image — centered, takes up most of the middle */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <Image
            src={status.image}
            alt={status.title}
            width={989}
            height={989}
            priority
            unoptimized
            draggable={false}
            className="mx-auto h-auto select-none"
            style={{
              width: "min(88vw, 52vh, 580px)",
              maxHeight: "50vh",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Description — center-aligned, close to image, large font.
            Uses \n\n for paragraph breaks in the data (rendered by
            whiteSpace: pre-line). */}
        <p
          className="w-full shrink-0 text-center text-[#001050]/90"
          style={{
            fontSize: "clamp(1.4rem, min(5.5vw, 3.2vh), 2rem)",
            fontFamily: SYSTEM_FONT,
            fontWeight: 400,
            whiteSpace: "pre-line",
            lineHeight: 1.35,
            marginTop: "-0.25rem",
          }}
        >
          {status.description}
        </p>

        {/* QR row — no glassy container, just the content directly.
            QR on left, instruction on right. */}
        <div
          className="flex w-full shrink-0 flex-wrap items-center"
          style={{
            gap: "clamp(1rem, 3vw, 1.5rem)",
            paddingTop: "clamp(0.5rem, 1.5vh, 1rem)",
          }}
        >
          <div className="shrink-0" style={{ width: "min(220px, 34vw)" }}>
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
              fontSize: "clamp(1.4rem, min(5.5vw, 3.2vh), 2rem)",
              fontFamily: SYSTEM_FONT,
              fontWeight: 700,
              whiteSpace: "pre-line",
            }}
          >
            {"Scan to take your vibe with you.\nClaim your SPF gift at the counter."}
          </p>
        </div>
      </div>
    </div>
  );
}

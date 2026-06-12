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

      {/* Content sits directly against the screen — no glass shell
          behind. Full inset with padding for breathing room. */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center overflow-hidden"
        style={{
          paddingTop: "clamp(1.5rem, 4vh, 2.5rem)",
          paddingBottom: "clamp(1.25rem, 3vh, 2rem)",
          paddingInline: "clamp(1.25rem, 4vw, 2rem)",
          gap: "clamp(0.25rem, 1vh, 0.75rem)",
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

        {/* Hero vibe image — fills most of the middle. The PNGs have
            baked-in whitespace so we scale up aggressively and let
            object-fit: contain handle the aspect ratio. */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
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
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Description — center-aligned, overlaps into the image's
            bottom whitespace via negative marginTop so it reads as
            "right under the subject" not "under the PNG bounding box".
            Large font with paragraph breaks via whiteSpace: pre-line. */}
        <p
          className="w-full shrink-0 text-center text-[#001050]/90"
          style={{
            fontSize: "clamp(1.6rem, min(6.5vw, 3.8vh), 2.4rem)",
            fontFamily: SYSTEM_FONT,
            fontWeight: 400,
            whiteSpace: "pre-line",
            lineHeight: 1.35,
            marginTop: "clamp(-3rem, -4vh, -1.5rem)",
          }}
        >
          {status.description}
        </p>

        {/* QR area — white container, centered, holds QR + instruction */}
        <div
          className="flex shrink-0 flex-wrap items-center justify-center self-center rounded-[28px]"
          style={{
            padding: "clamp(1rem, 2.5vh, 1.5rem) clamp(1.25rem, 3vw, 2rem)",
            gap: "clamp(1rem, 3vw, 1.5rem)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: [
              "0 0 0 1px rgba(0,16,80,0.06) inset",
              "0 1px 0 rgba(255,255,255,0.95) inset",
              "0 6px 22px rgba(120,160,220,0.18)",
            ].join(", "),
          }}
        >
          <div className="shrink-0" style={{ width: "min(200px, 30vw)" }}>
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
              minWidth: "min(200px, 40vw)",
            }}
          >
            {"Scan to take your vibe with you.\nClaim your SPF gift at the counter."}
          </p>
        </div>
      </div>
    </div>
  );
}

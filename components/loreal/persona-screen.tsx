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
  // QR size scales with viewport. Computed in an effect so the SSR pass
  // doesn't access `window` and trigger a hydration warning.
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
      {/* Tap-anywhere reset — full-screen invisible button at z-0 so the
          kiosk auto-reset / brand ambassador can advance without a CTA. */}
      <button
        type="button"
        aria-label="Finish"
        onClick={onFinish}
        className="absolute inset-0 z-0 cursor-default"
        style={{ background: "transparent" }}
      />

      {/* Inner glass shell — matches the question screens' inset frame so
          this screen reads as part of the same kiosk experience. */}
      <div
        className="absolute inset-3 z-10 flex flex-col items-center overflow-hidden rounded-[40px]"
        style={{
          paddingTop: "clamp(2rem, 5vh, 3rem)",
          paddingBottom: "clamp(1.5rem, 4vh, 2.5rem)",
          paddingInline: "clamp(1rem, 4vw, 2rem)",
          gap: "clamp(0.75rem, 2vh, 1.5rem)",
        }}
      >
        {/* Salesforce Beach color logo at top */}
        <Image
          src="/loreal/salesforce-beach-logo.png"
          alt="Salesforce Beach"
          width={1200}
          height={240}
          priority
          unoptimized
          draggable={false}
          className="h-auto shrink-0 select-none"
          style={{ width: "min(60vw, 32vh, 320px)" }}
        />

        {/* Glassy header card — ONLY wraps the vibe name row */}
        <div
          className="flex w-full max-w-[680px] shrink-0 items-center rounded-[32px]"
          style={{
            paddingInline: "clamp(1rem, 3vw, 1.5rem)",
            paddingBlock: "clamp(0.75rem, 2vh, 1.25rem)",
            gap: "clamp(0.5rem, 1.5vw, 0.75rem)",
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
            style={{ width: "clamp(28px, 4vw, 40px)", height: "auto" }}
          />
          <div className="flex min-w-0 flex-col items-start">
            <span
              className="font-medium leading-tight text-[#001050]/70"
              style={{
                fontSize: "clamp(0.85rem, 2vh, 1.05rem)",
                fontFamily: SYSTEM_FONT,
              }}
            >
              Your Cannes OOO vibe:
            </span>
            <h1
              className="font-bold leading-[1.05] tracking-tight"
              style={{
                fontSize: "clamp(1.8rem, min(8vw, 5vh), 2.8rem)",
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

        {/* Hero vibe image */}
        <div className="flex min-h-0 w-full max-w-[680px] flex-1 items-center justify-center">
          <Image
            src={status.image}
            alt={status.title}
            width={989}
            height={989}
            priority
            unoptimized
            draggable={false}
            className="h-auto select-none"
            style={{
              width: "min(80vw, 48vh, 480px)",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Description */}
        <p
          className="w-full max-w-[680px] shrink-0 text-left text-[#001050]/85"
          style={{
            fontSize: "clamp(1.2rem, min(5vw, 2.8vh), 1.6rem)",
            fontFamily: SYSTEM_FONT,
            fontWeight: 400,
            whiteSpace: "pre-line",
            lineHeight: 1.35,
          }}
        >
          {status.description}
        </p>

        {/* QR row — glassy container, horizontal layout */}
        <div
          className="flex w-full max-w-[680px] shrink-0 items-center rounded-[24px]"
          style={{
            padding: "clamp(0.85rem, 2vh, 1.25rem)",
            gap: "clamp(0.75rem, 2vw, 1rem)",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            boxShadow: [
              "0 0 0 1px rgba(0,16,80,0.06) inset",
              "0 1px 0 rgba(255,255,255,0.95) inset",
              "0 6px 22px rgba(120,160,220,0.18)",
            ].join(", "),
          }}
        >
          <div className="shrink-0" style={{ width: "min(140px, 22vw)" }}>
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
            className="flex-1 text-left leading-snug text-[#001050]/85"
            style={{
              fontSize: "clamp(1.3rem, min(5vw, 3vh), 1.8rem)",
              fontFamily: SYSTEM_FONT,
              fontWeight: 700,
            }}
          >
            Scan to take your vibe with you and claim your SPF gift at the
            counter.
          </p>
        </div>
      </div>
    </div>
  );
}

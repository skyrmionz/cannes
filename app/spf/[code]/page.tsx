"use client";

import { useMemo, useState } from "react";
import { use } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Download, Check } from "lucide-react";
import {
  decodeLorealResult,
  getStatus,
  isLorealResultExpired,
} from "@/lib/loreal-personas";

const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

const TITLE_GRADIENT =
  "linear-gradient(105.2deg, #9675FE 21.37%, #FF7371 99.99%)";

const SYSTEM_FONT =
  'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

// Lock the page to one viewport (no scroll) by sizing on dynamic viewport
// height (dvh) so iOS / Android browser chrome doesn't push content off.
const FULLPAGE_STYLE: React.CSSProperties = {
  background: LOREAL_GRADIENT,
  width: "100vw",
  height: "100dvh",
  overflow: "hidden",
  position: "fixed",
  inset: 0,
};

const GLASS_BUTTON_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(12px) saturate(140%)",
  WebkitBackdropFilter: "blur(12px) saturate(140%)",
  boxShadow: [
    "0 0 0 1px rgba(0,16,80,0.08) inset",
    "0 1px 0 rgba(255,255,255,0.95) inset",
    "0 6px 18px rgba(120,160,220,0.18)",
  ].join(", "),
  paddingInline: "clamp(1.25rem, 4vw, 2rem)",
  paddingBlock: "clamp(0.85rem, 2.4vh, 1.4rem)",
  fontSize: "clamp(1rem, min(4.2vw, 2.4vh), 1.2rem)",
  fontFamily: SYSTEM_FONT,
};

export default function ResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: encoded } = use(params);
  const data = useMemo(() => decodeLorealResult(encoded), [encoded]);
  const expired = data ? isLorealResultExpired(data.timestamp) : false;

  if (!data) {
    return (
      <Fallback message="This link is invalid. Please visit the Salesforce SPF booth for a new one." />
    );
  }
  if (expired) {
    return (
      <Fallback message="This gift link has expired. Please visit the Salesforce SPF booth for a new one." />
    );
  }

  // Re-derive the status from the encoded inputs so the page always renders
  // the current matrix's title/description/image.
  const status = getStatus(data.sun, data.hydration, data.agenda);

  const [saved, setSaved] = useState(false);
  const handleSave = async () => {
    try {
      // Try the Web Share API with a file — on iOS/Android this opens
      // the native share sheet where "Save Image" puts it in the
      // camera roll. Falls back to <a download> on desktop.
      const res = await fetch(status.download);
      const blob = await res.blob();
      const file = new File([blob], `cannes-ooo-${data.code}.jpg`, {
        type: "image/jpeg",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback: trigger a download (saves to Files on phone)
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }
    } catch {
      // User cancelled share sheet or fetch failed — still show saved
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="text-[#001050]" style={FULLPAGE_STYLE}>
      {/* Content — flex column, no background glass container */}
      <div
        className="relative z-10 flex h-full w-full flex-col items-center"
        style={{
          paddingTop: "clamp(1.5rem, 5vh, 2.5rem)",
          paddingBottom: "clamp(1.25rem, 4vh, 2rem)",
          paddingInline: "clamp(1rem, 4vw, 1.5rem)",
          gap: "clamp(0.75rem, 2vh, 1.25rem)",
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

        {/* Glassy vibe card — ONLY wraps the header row */}
        <motion.div
          className="flex w-full max-w-[480px] shrink-0 items-center justify-center gap-3 overflow-visible rounded-[32px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
          style={{
            paddingInline: "clamp(1rem, 4vw, 1.5rem)",
            paddingBlock: "clamp(1rem, 2.5vh, 1.5rem)",
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
          {/* Header row — sun emoji left, label + name stacked right */}
          <Image
            src="/loreal/sun-emoji.png"
            alt=""
            width={64}
            height={64}
            unoptimized
            draggable={false}
            className="shrink-0 select-none"
            style={{ width: "clamp(28px, 8vw, 40px)", height: "auto" }}
          />
          <div className="flex min-w-0 flex-col items-start">
            <span
              className="font-medium leading-tight text-[#001050]/70"
              style={{
                fontSize: "clamp(0.85rem, 3.4vw, 1.05rem)",
                fontFamily: SYSTEM_FONT,
              }}
            >
              Your Cannes OOO vibe:
            </span>
            <h1
              className="font-bold leading-[1.05] tracking-tight"
              style={{
                fontSize: "clamp(1.5rem, min(7vw, 4.4vh), 2.4rem)",
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
        </motion.div>

        {/* Hero vibe image — outside the glass card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
          className="flex min-h-0 w-full max-w-[480px] flex-1 items-center justify-center"
        >
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
              width: "min(62vw, 34vh, 340px)",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </motion.div>

        {/* Description — outside the glass card */}
        <motion.p
          className="w-full max-w-[480px] shrink-0 text-center text-[#001050]/85"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          style={{
            fontSize: "clamp(1rem, min(4.2vw, 2.4vh), 1.35rem)",
            fontFamily: SYSTEM_FONT,
            fontWeight: 400,
            whiteSpace: "pre-line",
            lineHeight: 1.35,
          }}
        >
          {status.description}
        </motion.p>

        {/* Two action buttons — outside the glass card */}
        <motion.div
          className="flex w-full max-w-[480px] shrink-0 flex-col items-stretch"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.5, ease: "easeOut" }}
          style={{ gap: "clamp(0.5rem, 1.5vh, 1rem)" }}
        >
          <motion.button
            type="button"
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-3 rounded-full font-semibold text-[#001050]"
            style={{
              ...GLASS_BUTTON_STYLE,
              background: saved
                ? "rgba(150, 220, 150, 0.7)"
                : GLASS_BUTTON_STYLE.background,
              transition: "background 0.3s ease",
            }}
          >
            {saved ? (
              <Check
                aria-hidden
                style={{ width: "clamp(20px, 5vw, 26px)", height: "auto" }}
              />
            ) : (
              <Download
                aria-hidden
                style={{ width: "clamp(20px, 5vw, 26px)", height: "auto" }}
              />
            )}
            <span>{saved ? "Saved!" : "Save image"}</span>
          </motion.button>

          <motion.a
            href="https://www.salesforce.com/agentforce/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-3 rounded-full font-semibold text-[#001050]"
            style={GLASS_BUTTON_STYLE}
          >
            <Image
              src="/loreal/agentforce-icon.png"
              alt=""
              width={128}
              height={128}
              unoptimized
              draggable={false}
              className="shrink-0 select-none"
              style={{ width: "clamp(24px, 6vw, 28px)", height: "auto" }}
            />
            <span>Visit agentforce.com</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}

function Fallback({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ ...FULLPAGE_STYLE }}
    >
      <p
        className="max-w-md text-center leading-snug text-[#001050]/80"
        style={{
          fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)",
          fontFamily: SYSTEM_FONT,
        }}
      >
        {message}
      </p>
    </div>
  );
}

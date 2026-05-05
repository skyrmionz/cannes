"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { CinematicScene } from "./result-cinematic/scene";
import { encodeF1ShareData } from "@/lib/f1-share";

interface ResultScreenProps {
  driverName: string;
  team: string | null;
  persona: string | null;
  mp3Url: string | null;
  onStartOver: () => void;
  /** When true, this is the shared /f1/result/[code] view (no QR, no Start Over label change). */
  sharedView?: boolean;
}

export function ResultScreen({
  driverName,
  team,
  persona,
  mp3Url,
  onStartOver,
  sharedView = false,
}: ResultScreenProps) {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayFallback = useCallback(() => {
    if (!mp3Url) return;
    if (!fallbackAudioRef.current) {
      fallbackAudioRef.current = new Audio(mp3Url);
    }
    fallbackAudioRef.current.play().then(() => {
      setAutoplayBlocked(false);
    });
  }, [mp3Url]);

  // Build the shareable URL only when we have everything we need AND we're not
  // already on the shared view.
  const shareUrl = useMemo(() => {
    if (sharedView) return null;
    if (!team || !persona || !mp3Url) return null;
    if (typeof window === "undefined") return null;
    const encoded = encodeF1ShareData({
      driverName,
      team,
      persona,
      mp3Url,
    });
    return `${window.location.origin}/f1/result/${encoded}`;
  }, [driverName, team, persona, mp3Url, sharedView]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />

      {/* Logos pinned top center */}
      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

      {/* Slackbot + title, left-aligned like the other screens */}
      <div className="relative z-10 px-6 pt-3 md:px-12 md:pt-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-2 h-[2px] w-16 bg-[#E10600]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <div className="flex items-center gap-4">
            <SlackbotAvatar className="h-10 w-10 flex-shrink-0 md:h-12 md:w-12" />
            <motion.h1
              className="text-xl font-semibold uppercase tracking-[0.15em] text-white md:text-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              Congratulations, welcome to the Cannes podium,{" "}
              <span className="text-[#E10600]">{driverName}</span>!
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Cinematic 3D stage */}
      <div className="relative z-10 flex-1">
        {team && persona ? (
          <CinematicScene
            teamId={team}
            personaId={persona}
            mp3Url={mp3Url}
            onAudioBlocked={() => setAutoplayBlocked(true)}
          />
        ) : null}

        {/* Autoplay-blocked fallback */}
        {autoplayBlocked && mp3Url && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handlePlayFallback}
              className="pointer-events-auto flex items-center gap-3 rounded-sm bg-[#E10600] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b80500]"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Play your anthem
            </button>
          </motion.div>
        )}

        {/* QR share card — bottom-right corner of the stage */}
        {shareUrl && (
          <motion.div
            className="pointer-events-auto absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2 rounded-sm border border-neutral-700 bg-[#0f0f0f]/90 p-3 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="rounded-sm bg-white p-2">
              <QRCodeSVG
                value={shareUrl}
                size={110}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="M"
              />
            </div>
            <p className="max-w-[7rem] text-center text-[10px] uppercase tracking-wider text-neutral-400">
              Scan to take your podium home
            </p>
            <p className="text-[9px] text-neutral-600">Expires in 1 hour</p>
          </motion.div>
        )}
      </div>

      {/* Start Over pinned bottom-left (leave room for the QR on the right) */}
      <div className="relative z-10 px-4 pb-4 pt-2 md:px-8 md:pb-6">
        <motion.div
          className="mx-auto flex max-w-5xl items-center justify-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-xs font-bold leading-none text-white">
              R
            </span>
            {sharedView ? "Start your engine" : "Start Over"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { CinematicScene } from "./result-cinematic/scene";
import { ConfettiOverlay } from "./result-cinematic/confetti-overlay";

interface ResultScreenProps {
  driverName: string;
  grandPrix: string | null;
  celebration: string | null;
  team: string | null;
  persona: string | null;
  songUrl: string | null;
  onStartOver: () => void;
  sharedView?: boolean;
}

export function ResultScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  persona,
  songUrl,
  onStartOver,
  sharedView = false,
}: ResultScreenProps) {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareErrored, setShareErrored] = useState(false);
  const [commentaryUrl, setCommentaryUrl] = useState<string | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const sharedRef = useRef(false);
  const commentaryRef = useRef(false);

  // Fetch personalised commentary audio once on mount
  useEffect(() => {
    if (commentaryRef.current) return;
    commentaryRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:        driverName,
            grandPrix:   grandPrix ?? "Monaco",
            celebration: celebration ?? "jump",
            team:        team ?? "the team",
          }),
          signal: controller.signal,
        });

        if (res.ok && res.headers.get("Content-Type")?.startsWith("audio/")) {
          const blob = await res.blob();
          setCommentaryUrl(URL.createObjectURL(blob));
        }
        // If no ElevenLabs key the API returns JSON — we just skip commentary audio.
      } catch {
        // Commentary is enhancement-only — silence any errors.
      }
    })();

    return () => controller.abort();
  }, [driverName, grandPrix, celebration, team]);

  // Create share link
  useEffect(() => {
    if (sharedView) return;
    if (!team || !persona || !songUrl) return;
    if (sharedRef.current) return;
    sharedRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverName, team, persona, mp3Url: songUrl }),
          signal: controller.signal,
        });
        if (!res.ok) { setShareErrored(true); return; }
        const { code } = (await res.json()) as { code: string };
        if (typeof window !== "undefined") {
          setShareUrl(`${window.location.origin}/f1/result/${code}`);
        }
      } catch {
        setShareErrored(true);
      }
    })();
    return () => controller.abort();
  }, [driverName, team, persona, songUrl, sharedView]);

  const handlePlayFallback = useCallback(() => {
    if (!songUrl) return;
    if (!fallbackAudioRef.current) {
      fallbackAudioRef.current = new Audio(songUrl);
    }
    fallbackAudioRef.current.play().then(() => setAutoplayBlocked(false));
  }, [songUrl]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DotBg />
      <ConfettiOverlay />

      <div className="relative z-10 pt-4">
        <LogoHeader className="justify-center" />
      </div>

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

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="relative w-full flex-1 min-h-0">
          {team && persona ? (
            <CinematicScene
              teamId={team}
              personaId={persona}
              songUrl={songUrl}
              commentaryUrl={commentaryUrl}
              onAudioBlocked={() => setAutoplayBlocked(true)}
            />
          ) : null}

          {autoplayBlocked && songUrl && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handlePlayFallback}
                className="pointer-events-auto flex items-center gap-3 rounded-sm bg-[#E10600] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b80500]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play your anthem
              </button>
            </motion.div>
          )}
        </div>

        {!sharedView && (
          <div className="relative z-30 flex flex-col items-center pb-2">
            {shareUrl ? (
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="rounded-sm bg-white p-2">
                  <QRCodeSVG
                    value={shareUrl}
                    size={96}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-300">
                  Scan to save your podium song
                </p>
              </motion.div>
            ) : shareErrored || !songUrl ? null : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-[96px] w-[96px] animate-pulse rounded-sm bg-neutral-800" />
                <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                  Preparing your share link...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-40 px-4 pb-4 pt-2 md:px-8 md:pb-6">
        <motion.div
          className="mx-auto flex max-w-5xl items-center justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#E10600] text-xs font-bold leading-none text-white">
              R
            </span>
            {sharedView ? "Start your engine" : "Start Over"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

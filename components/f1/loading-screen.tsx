"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";

interface LoadingScreenProps {
  driverName: string;
  grandPrix: string | null;
  celebration: string | null;
  team: string | null;
  persona: string | null;
  onComplete: (mp3Url: string) => void;
  onError: () => void;
}

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 180_000;

export function LoadingScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  persona,
  onComplete,
  onError,
}: LoadingScreenProps) {
  const [message, setMessage] = useState("Creating your theme song now...");
  const [errored, setErrored] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const controller = new AbortController();
    const startedAt = Date.now();

    async function run() {
      try {
        const genRes = await fetch("/api/generate-song", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverName, grandPrix, celebration, team, persona }),
          signal: controller.signal,
        });
        if (!genRes.ok) {
          const err = await genRes.json().catch(() => ({}));
          throw new Error(err.error ?? `generate-song ${genRes.status}`);
        }
        const { jobId } = (await genRes.json()) as { jobId: string };

        setMessage("Spinning up the studio...");

        while (!cancelled) {
          if (Date.now() - startedAt > MAX_WAIT_MS) {
            throw new Error("Song generation timed out");
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          if (cancelled) return;

          const statusRes = await fetch(`/api/song-status/${jobId}`, {
            signal: controller.signal,
          });
          if (!statusRes.ok) {
            const err = await statusRes.json().catch(() => ({}));
            throw new Error(err.error ?? `song-status ${statusRes.status}`);
          }
          const status = (await statusRes.json()) as {
            status: "pending" | "complete" | "failed";
            mp3Url?: string;
          };

          if (status.status === "complete" && status.mp3Url) {
            onComplete(status.mp3Url);
            return;
          }
          if (status.status === "failed") {
            throw new Error("Song generation failed");
          }
          setMessage("Mixing your track...");
        }
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        console.error(err);
        setErrored(true);
        setMessage("We couldn't build your track. Going back to retry.");
        setTimeout(onError, 2000);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [driverName, grandPrix, celebration, team, persona, onComplete, onError]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      {/* Logos pinned to the top */}
      <motion.div
        className="relative z-10 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
      </motion.div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SlackbotAvatar className="mx-auto mb-8 h-28 w-28 md:h-36 md:w-36" />
        </motion.div>

        <motion.h2
          key={message}
          className="text-center text-xl font-semibold uppercase tracking-[0.2em] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.h2>

        {!errored && (
          <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-800">
            <motion.div
              className="h-full rounded-full bg-[#E10600]"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 60, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

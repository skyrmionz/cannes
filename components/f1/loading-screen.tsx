"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LogoHeader, SlackbotAvatar } from "./logo-header";
import { DotBg } from "./dot-bg";
import { teamOptions } from "@/app/f1/options";

interface LoadingScreenProps {
  driverName: string;
  grandPrix: string | null;
  celebration: string | null;
  team: string | null;
  onComplete: (songUrl: string) => void;
  onError: () => void;
}

const TOTAL_MS = 3500;
const MESSAGE_INTERVAL_MS = 3500;

const LOADING_MESSAGES: string[] = [
  "Warming up the engines...",
  "Tuning the DRS to D major...",
  "Laying down heartbeat drums...",
  "Negotiating with the FIA on tempo...",
  "Mixing the crowd noise at Parabolica...",
  "Polishing the trumpet fanfare...",
  "Calibrating the bass line through Eau Rouge...",
  "Checking tire pressure on the hi-hats...",
  "Rolling the synth onto the grid...",
  "Sending engineers into the mixing booth...",
  "Teaching the snare how to podium...",
  "Bolting on the brass section aero package...",
  "Routing the kick drum through Casino Square...",
  "Getting the click track up to racing speed...",
  "Calling strategy on the bridge...",
  "Swapping out vocals for victory horns...",
  "Drifting through the minor key chicane...",
  "Loading the safety car into the pre-chorus...",
  "Queueing up the podium anthem...",
  "Telling the bass player about the undercut...",
  "Spooling up the turbocharged arpeggios...",
  "Checking the mirrors for flat notes...",
  "Blasting through the final sector...",
  "Deploying the overtake button on beat two...",
  "Engaging DRS on the drop...",
  "Dropping the hammer and the beat...",
  "Crossing the finish line in stereo...",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function teamToMelodyGroup(teamId: string): string {
  const team = teamOptions.find((t) => t.id === teamId);
  return team?.melodyGroup ?? teamId;
}

const MELODY_GROUP_STEM: Record<string, string> = {
  "red-bull": "red-bull",
  ferrari:    "ferrari",
  mclaren:    "mclaren",
  mercedes:   "mercedes",
  haas:       "haas",
};

const CELEBRATION_STEM: Record<string, string> = {
  jump: "jump", nod: "nod", meltdown: "meltdown", frozen: "frozen", tears: "tears",
};

export function LoadingScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  onComplete,
  onError,
}: LoadingScreenProps) {
  const messagesRef = useRef<string[]>(shuffle(LOADING_MESSAGES));
  const messageIndexRef = useRef(0);
  const [message, setMessage] = useState(messagesRef.current[0]);
  const barRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startedAt = performance.now();

    const messageTimer = setInterval(() => {
      messageIndexRef.current =
        (messageIndexRef.current + 1) % messagesRef.current.length;
      setMessage(messagesRef.current[messageIndexRef.current]);
    }, MESSAGE_INTERVAL_MS);

    let rafId = 0;
    const tick = () => {
      const pct = Math.min(((performance.now() - startedAt) / TOTAL_MS) * 100, 100);
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (pct < 100) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const circuit     = grandPrix ?? "monaco";
    const cel         = CELEBRATION_STEM[celebration ?? ""] ?? (celebration ?? "jump");
    const melody      = MELODY_GROUP_STEM[teamToMelodyGroup(team ?? "")] ?? "red-bull";
    const songUrl     = `/songs/${circuit}-${cel}-${melody}.wav`;

    const timer = setTimeout(() => {
      clearInterval(messageTimer);
      cancelAnimationFrame(rafId);
      setMessage("Crossing the finish line...");
      if (barRef.current) {
        barRef.current.style.transition = "width 300ms ease-out";
        barRef.current.style.width = "100%";
      }
      setTimeout(() => onComplete(songUrl), 400);
    }, TOTAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(messageTimer);
      cancelAnimationFrame(rafId);
    };
  }, [grandPrix, celebration, team, onComplete, onError]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4">
      <DotBg />

      <motion.div
        className="relative z-10 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <LogoHeader className="justify-center" />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SlackbotAvatar className="mx-auto mb-8 h-28 w-28 md:h-36 md:w-36" />
        </motion.div>

        {driverName && (
          <motion.p
            className="mb-2 text-xs uppercase tracking-[0.25em] text-[#E10600]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Building your track, {driverName}
          </motion.p>
        )}

        <motion.h2
          key={message}
          className="min-h-[2rem] px-4 text-center text-xl font-semibold uppercase tracking-[0.2em] text-white"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.h2>

        <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-800">
          <div
            ref={barRef}
            className="h-full rounded-full bg-[#E10600]"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

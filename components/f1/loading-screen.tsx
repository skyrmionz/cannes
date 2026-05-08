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

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 60_000;
const MESSAGE_INTERVAL_MS = 4000;
const PHASE_A_MS = 12_000;

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
  "Running a practice lap in 4/4...",
  "Spooling up the turbocharged arpeggios...",
  "Checking the mirrors for flat notes...",
  "Blasting through the final sector...",
  "Stacking harmonies on the tow...",
  "Deploying the overtake button on beat two...",
  "Welding the bridge to the chorus...",
  "Syncing the metronome to Silverstone...",
  "Fueling the synth pads for the final stint...",
  "Tightening the wheel nuts on the drum kit...",
  "Calibrating brass against the wind tunnel...",
  "Routing the mix through pit lane...",
  "Balancing the front and rear of the bass...",
  "Running the hot lap at 140 BPM...",
  "Wiring up the victory theme...",
  "Bringing the tempo up through turn one...",
  "Dialing in the trumpet's downforce...",
  "Flagging yellow on the bridge...",
  "Loading spare tracks into the garage...",
  "Checking the telemetry on the hi-hats...",
  "Warming the rubber on the kick drum...",
  "Greasing the trombone slides...",
  "Reviewing steward decisions on key changes...",
  "Radioing the driver about the breakdown...",
  "Cutting slicks into the strings...",
  "Tightening the lug nuts on the snare...",
  "Pulling the synth into the pits for a refresh...",
  "Briefing the brass on race strategy...",
  "Putting champagne on the mixing desk...",
  "Charging up the supersaw battery...",
  "Turning off traction control on the arpeggios...",
  "Racing the click track to the finish line...",
  "Feathering the throttle on the bass...",
  "Setting the fastest lap on the hook...",
  "Scrubbing off extra reverb on the straight...",
  "Choosing between medium and hard harmonies...",
  "Rolling through parc fermé with the master bus...",
  "Engaging DRS on the drop...",
  "Adjusting the diff on the drum pattern...",
  "Mapping engine modes to chord progressions...",
  "Getting the pit crew to record claps...",
  "Polishing the trophy, then the cymbals...",
  "Applying camber to the French horn...",
  "Calculating ERS deployment per bar...",
  "Radioing in for a tire change on the bridge...",
  "Locking the differential on the downbeat...",
  "Tightening the seatbelt before the drop...",
  "Sending the trumpet out for qualifying...",
  "Slipstreaming into the chorus...",
  "Installing the halo on the synth lead...",
  "Checking pit-wall for final mix approval...",
  "Pushing the tempo into the red zone...",
  "Running through Eau Rouge in triplets...",
  "Dropping the hammer and the beat...",
  "Overtaking silence at the apex...",
  "Bringing the band onto the grid...",
  "Finalizing the halo mix...",
  "Loading the celebration cannon with brass...",
  "Powering the synth with hybrid electric...",
  "Dialing in the anti-stall on the intro...",
  "Programming the strategy into the sequencer...",
  "Rehearsing the victory lap melody...",
  "Pre-heating the analog saw-wave...",
  "Checking tire degradation on the kick drum...",
  "Triggering fireworks on every downbeat...",
  "Coaxing the bassline through Becketts...",
  "Setting the kick drum's launch control...",
  "Routing telemetry to the mastering chain...",
  "Blocking the undercut with extra reverb...",
  "Sending the synth for a shakedown...",
  "Locking in the fastest sector on the chorus...",
  "Qualifying each note on pole position...",
  "Pouring champagne on the mixing console...",
  "Feeding the tuba into the intercooler...",
  "Setting the racing line through the bass solo...",
  "Activating the beat-energy-recovery system...",
  "Sticking the landing on the final chord...",
  "Bringing the drums in for a tire change...",
  "Welding a new exhaust onto the bassline...",
  "Running the synth through scrutineering...",
  "Flagging the chequered on the last bar...",
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

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function computeProgress(elapsedMs: number): number {
  if (elapsedMs <= PHASE_A_MS) {
    return easeOutExpo(elapsedMs / PHASE_A_MS) * 85;
  }
  const tail = elapsedMs - PHASE_A_MS;
  return 85 + (95 - 85) * (1 - Math.exp(-tail / 20_000));
}

export function LoadingScreen({
  driverName,
  grandPrix,
  celebration,
  team,
  persona,
  onComplete,
  onError,
}: LoadingScreenProps) {
  const messagesRef = useRef<string[]>(shuffle(LOADING_MESSAGES));
  const messageIndexRef = useRef(0);
  const [message, setMessage] = useState(messagesRef.current[0]);
  const [errored, setErrored] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const controller = new AbortController();
    const startedAt = performance.now();

    // Rotate the loading copy every MESSAGE_INTERVAL_MS
    const messageTimer = setInterval(() => {
      if (cancelled || completedRef.current) return;
      messageIndexRef.current =
        (messageIndexRef.current + 1) % messagesRef.current.length;
      setMessage(messagesRef.current[messageIndexRef.current]);
    }, MESSAGE_INTERVAL_MS);

    // Drive the progress bar width with rAF — write to the DOM directly so
    // we don't round-trip through React reconciliation 60x/second.
    let rafId = 0;
    const tick = () => {
      if (cancelled || completedRef.current) return;
      const elapsed = performance.now() - startedAt;
      const pct = computeProgress(elapsed);
      if (barRef.current) {
        barRef.current.style.width = `${pct}%`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

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

        while (!cancelled) {
          if (performance.now() - startedAt > MAX_WAIT_MS) {
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
            completedRef.current = true;
            if (barRef.current) {
              barRef.current.style.transition = "width 300ms ease-out";
              barRef.current.style.width = "100%";
            }
            setMessage("Crossing the finish line...");
            setTimeout(() => onComplete(status.mp3Url!), 500);
            return;
          }
          if (status.status === "failed") {
            throw new Error("Song generation failed");
          }
        }
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        console.error(err);
        completedRef.current = true;
        setErrored(true);
        setMessage("We couldn't build your track. Going back to retry.");
        setTimeout(onError, 2000);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(messageTimer);
      cancelAnimationFrame(rafId);
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
          className="min-h-[2rem] px-4 text-center text-xl font-semibold uppercase tracking-[0.2em] text-white"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.h2>

        {!errored && (
          <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-800">
            <div
              ref={barRef}
              className="h-full rounded-full bg-[#E10600]"
              style={{ width: "0%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

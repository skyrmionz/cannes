"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { TransparentVideoLoop } from "@/components/ui/transparent-video-loop";

export type DropletLevel = 0 | 1 | 2;
export type DropletPhase = "idle" | "transitioning";

const LEVELS: DropletLevel[] = [0, 1, 2];
const LEVEL_NAME: Record<DropletLevel, string> = { 0: "low", 1: "mid", 2: "full" };

// All four directional fills. Each gets its own permanently-mounted video so
// we never have to call .load() (which resets readyState and produces the
// blank-frame flicker the user sees on click).
const FILLS: Array<{
  key: string;
  from: DropletLevel;
  to: DropletLevel;
  src: string;
}> = [
  { key: "low-to-mid", from: 0, to: 1, src: "/loreal/droplet-low-to-mid" },
  { key: "mid-to-full", from: 1, to: 2, src: "/loreal/droplet-mid-to-full" },
  { key: "full-to-mid", from: 2, to: 1, src: "/loreal/droplet-full-to-mid" },
  { key: "mid-to-low", from: 1, to: 0, src: "/loreal/droplet-mid-to-low" },
];

interface Props {
  width: string | number;
  level: DropletLevel;
  phase: DropletPhase;
  fromLevel?: DropletLevel;
  toLevel?: DropletLevel;
  onTransitionEnd?: () => void;
}

// Permanent-mount model:
// - All 3 idle videos AND all 4 directional fill videos are mounted continuously.
//   Visibility decides which shows. No element ever has its src reassigned.
// - During transition, all idles are hidden; the matching fill overlay plays.
// - The active fill is identified synchronously from props (no useEffect lag),
//   so its visibility flips on the same render that flips phase=transitioning.
// - After the fill ends, the destination idle gets one rAF to paint underneath
//   before the fill is hidden — masks any handoff seam.
// - A "pop" scale keyframe fires at transitioning→idle to mask residual jitter.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const isTransitioning = phase === "transitioning";

  const activeFillKey =
    isTransitioning && fromLevel != null && toLevel != null
      ? `${LEVEL_NAME[fromLevel]}-to-${LEVEL_NAME[toLevel]}`
      : null;

  // Linger keeps the just-finished fill visible for one rAF after the parent
  // flips to idle so the destination idle paints underneath first.
  const [lingeringKey, setLingeringKey] = useState<string | null>(null);
  const lingeringKeyRef = useRef<string | null>(null);
  lingeringKeyRef.current = lingeringKey;

  // Pop animation when transitioning → idle.
  const controls = useAnimation();
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (prevPhase.current === "transitioning" && phase === "idle") {
      controls.start({
        scale: [1, 1.06, 0.97, 1.02, 1],
        transition: {
          duration: 0.42,
          times: [0, 0.25, 0.55, 0.8, 1],
          ease: "easeOut",
        },
      });
    }
    prevPhase.current = phase;
  }, [phase, controls]);

  return (
    <motion.div
      className="relative"
      style={{
        width,
        // Brightness now baked into the encode (eq=brightness=0.04 in
        // reencode-hq.sh). Wrapper-level filter is a small saturation lift
        // only, applied uniformly to idles and fills.
        filter: "saturate(1.05)",
      }}
      animate={controls}
      initial={{ scale: 1 }}
    >
      {LEVELS.map((lv) => {
        const name = LEVEL_NAME[lv];
        const src = `/loreal/droplet-${name}-idle`;
        const visible = !isTransitioning && level === lv;
        return (
          <div
            key={`idle-${name}`}
            className={lv === 0 ? "" : "absolute inset-0"}
            style={{
              visibility: visible ? "visible" : "hidden",
              pointerEvents: "none",
            }}
          >
            <TransparentVideoLoop
              mp4Src={`${src}.mp4`}
              webmSrc={`${src}.webm`}
              width="100%"
              className="block"
            />
          </div>
        );
      })}

      {FILLS.map((f) => (
        <FillVideo
          key={f.key}
          src={f.src}
          active={activeFillKey === f.key}
          lingering={lingeringKey === f.key}
          onEnded={() => {
            // Snapshot active key into linger so the fill stays visible while
            // parent flips phase=idle and the destination idle paints.
            setLingeringKey(f.key);
            onTransitionEnd?.();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setLingeringKey((prev) => (prev === f.key ? null : prev));
              });
            });
          }}
        />
      ))}
    </motion.div>
  );
}

interface FillVideoProps {
  src: string;
  active: boolean;
  lingering: boolean;
  onEnded: () => void;
}

// Permanently-mounted fill video. Plays from frame 0 each time it becomes
// active. Stays hidden otherwise. Never has its src reassigned, so there's
// no load() reset → no blank frame on click.
function FillVideo({ src, active, lingering, onEnded }: FillVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !wasActive.current) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    wasActive.current = active;
  }, [active]);

  return (
    <div
      className="absolute inset-0"
      style={{
        visibility: active || lingering ? "visible" : "hidden",
        pointerEvents: "none",
      }}
    >
      <video
        ref={ref}
        muted
        playsInline
        preload="auto"
        onEnded={onEnded}
        className="block"
        style={{ width: "100%", height: "auto" }}
      >
        <source src={`${src}.mp4`} type='video/mp4; codecs="hvc1"' />
        <source src={`${src}.webm`} type="video/webm" />
      </video>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { TransparentVideoLoop } from "@/components/ui/transparent-video-loop";

export type DropletLevel = 0 | 1 | 2;
export type DropletPhase = "idle" | "transitioning";

const LEVELS: DropletLevel[] = [0, 1, 2];
const LEVEL_NAME: Record<DropletLevel, string> = { 0: "low", 1: "mid", 2: "full" };

interface Props {
  width: string | number;
  level: DropletLevel;
  phase: DropletPhase;
  fromLevel?: DropletLevel;
  toLevel?: DropletLevel;
  onTransitionEnd?: () => void;
}

// Permanent-mount model:
// - All 3 idle videos are mounted continuously. Visibility decides which shows.
// - During transition, all idles are hidden; the fill overlay is on top.
// - The fill src is computed synchronously from props (no useEffect lag),
//   so there's no blank frame between click and overlay mount.
// - After fill ends, the overlay lingers for 2 rAFs while the destination
//   idle paints its first frame underneath.
// - A "pop" scale keyframe fires at the transitioning→idle handoff to mask
//   any residual handoff jitter.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const isTransitioning = phase === "transitioning";

  // Sync src derivation from props — overlay can mount in the same render
  // tick as the click that flipped phase to "transitioning".
  const computedSrc =
    isTransitioning && fromLevel != null && toLevel != null
      ? `/loreal/droplet-${LEVEL_NAME[fromLevel]}-to-${LEVEL_NAME[toLevel]}`
      : null;

  // After the parent flips phase to idle, we keep the fill mounted for a
  // brief linger so the destination idle can paint underneath before the
  // fill unmounts.
  const [lingeringSrc, setLingeringSrc] = useState<string | null>(null);
  const [lingerVisible, setLingerVisible] = useState(false);
  const overlayRef = useRef<HTMLVideoElement>(null);

  const activeSrc = computedSrc ?? lingeringSrc;
  const overlayMounted = activeSrc != null;
  const overlayVisible = computedSrc != null || lingerVisible;

  // Restart the overlay video whenever its src changes.
  useEffect(() => {
    if (!activeSrc) return;
    const v = overlayRef.current;
    if (!v) return;
    v.load();
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, [activeSrc]);

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

  const handleEnded = () => {
    // Snapshot current src into linger state so the overlay stays mounted
    // and visible while the parent flips phase=idle and the destination
    // idle paints.
    if (computedSrc) setLingeringSrc(computedSrc);
    setLingerVisible(true);
    onTransitionEnd?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLingerVisible(false);
        setTimeout(() => setLingeringSrc(null), 60);
      });
    });
  };

  return (
    <motion.div
      className="relative"
      style={{ width }}
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
              // Idle videos read darker/duller than the fill overlay due to a
              // gamma shift introduced by the boomerang concat path through
              // yuva420p. Bump brightness/saturation slightly at paint time
              // so static state matches mid-transition state.
              filter: "brightness(1.08) saturate(1.06)",
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

      {overlayMounted && (
        <div
          className="absolute inset-0"
          style={{
            visibility: overlayVisible ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <video
            ref={overlayRef}
            muted
            playsInline
            preload="auto"
            onEnded={handleEnded}
            className="block"
            style={{ width: "100%", height: "auto" }}
          >
            <source src={`${activeSrc}.mp4`} type='video/mp4; codecs="hvc1"' />
            <source src={`${activeSrc}.webm`} type="video/webm" />
          </video>
        </div>
      )}
    </motion.div>
  );
}

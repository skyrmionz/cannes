"use client";

import { useEffect, useState } from "react";
import { TransparentVideoLoop } from "@/components/ui/transparent-video-loop";
import { TransparentVideoOnce } from "@/components/ui/transparent-video-once";

export type DropletLevel = 0 | 1 | 2;
export type DropletPhase = "idle" | "transitioning";

const LEVEL_NAME: Record<DropletLevel, string> = {
  0: "low",
  1: "mid",
  2: "full",
};

interface Props {
  width: string | number;
  level: DropletLevel; // current "settled" level
  phase: DropletPhase;
  fromLevel?: DropletLevel;
  toLevel?: DropletLevel;
  onTransitionEnd?: () => void;
}

// Smooth handoff: the IDLE layer is always rendered at the destination level
// (`toLevel` while transitioning, `level` when idle), so the new level is
// already playing underneath the transition clip. The transition clip plays
// on top and fades out at the end, revealing the already-running idle —
// no blank frame, no flash of the underlying buttons.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const isTransitioning = phase === "transitioning";
  const idleLevel: DropletLevel =
    isTransitioning && toLevel != null ? toLevel : level;
  const idleName = LEVEL_NAME[idleLevel];
  const idleSrc = `/loreal/droplet-${idleName}-idle`;

  const transitionSrc =
    isTransitioning && fromLevel != null && toLevel != null
      ? `/loreal/droplet-${LEVEL_NAME[fromLevel]}-to-${LEVEL_NAME[toLevel]}`
      : null;

  // Keep transition mounted briefly after `ended` so we can fade it out
  // smoothly while the idle (already at the new level) plays underneath.
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayKey, setOverlayKey] = useState<string | null>(null);

  useEffect(() => {
    if (transitionSrc) {
      setOverlayKey(transitionSrc);
      setOverlayVisible(true);
    }
  }, [transitionSrc]);

  const handleEnded = () => {
    // Start fading the transition overlay out. The idle underneath is
    // already running at toLevel, so the user sees a clean handoff.
    setOverlayVisible(false);
    // Tell the parent the transition is done. Match the fade duration
    // below so phase flips to "idle" right as the overlay finishes fading.
    setTimeout(() => onTransitionEnd?.(), 220);
  };

  return (
    <div className="relative" style={{ width }}>
      <TransparentVideoLoop
        key={`idle-${idleName}`}
        mp4Src={`${idleSrc}.mp4`}
        webmSrc={`${idleSrc}.webm`}
        width="100%"
        className="block"
      />
      {overlayKey && (
        <div
          className="absolute inset-0"
          style={{
            opacity: overlayVisible ? 1 : 0,
            transition: "opacity 220ms ease-out",
          }}
        >
          <TransparentVideoOnce
            key={overlayKey}
            restartKey={overlayKey}
            mp4Src={`${overlayKey}.mp4`}
            webmSrc={`${overlayKey}.webm`}
            width="100%"
            onEnded={handleEnded}
            className="block"
          />
        </div>
      )}
    </div>
  );
}

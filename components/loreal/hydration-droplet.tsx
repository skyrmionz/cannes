"use client";

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
  // When phase === "transitioning", these describe the pair to play.
  fromLevel?: DropletLevel;
  toLevel?: DropletLevel;
  onTransitionEnd?: () => void;
}

// The droplet is two stacked layers:
//   - idle layer: always mounted, plays the *current* level's seamless loop.
//   - transition layer: only mounted while phase === "transitioning", plays
//     a one-shot fill (forward) or drain (reverse) clip on top of the idle
//     layer, then unmounts via onTransitionEnd.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const idleName = LEVEL_NAME[level];
  const idleSrc = `/loreal/droplet-${idleName}-idle`;

  const transitionSrc =
    phase === "transitioning" && fromLevel != null && toLevel != null
      ? `/loreal/droplet-${LEVEL_NAME[fromLevel]}-to-${LEVEL_NAME[toLevel]}`
      : null;

  return (
    <div className="relative" style={{ width }}>
      {/* Idle layer (always mounted; key bumps to force a reload on level change) */}
      <TransparentVideoLoop
        key={`idle-${idleName}`}
        mp4Src={`${idleSrc}.mp4`}
        webmSrc={`${idleSrc}.webm`}
        width="100%"
        className="block"
      />

      {/* Transition overlay — absolute on top, exact same size, plays once. */}
      {transitionSrc && (
        <div className="absolute inset-0">
          <TransparentVideoOnce
            key={transitionSrc}
            restartKey={transitionSrc}
            mp4Src={`${transitionSrc}.mp4`}
            webmSrc={`${transitionSrc}.webm`}
            width="100%"
            onEnded={onTransitionEnd}
            className="block"
          />
        </div>
      )}
    </div>
  );
}

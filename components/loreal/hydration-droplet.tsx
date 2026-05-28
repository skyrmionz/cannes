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
  fromLevel?: DropletLevel;
  toLevel?: DropletLevel;
  onTransitionEnd?: () => void;
}

// Handoff strategy:
// - During a transition, the idle layer underneath plays the OLD level
//   (`fromLevel`). The fill clip on top is fully opaque, but if it ever
//   loads slowly the user sees the old level — never the new one. So no
//   "ghost of the next state" before/during the animation.
// - The fill's last frame is anchor-pinned to the new idle's first frame
//   (Higgsfield --end-image), so when the fill ends and we swap the idle
//   source from fromLevel → toLevel, the visible pixels are identical.
//   No flash, no jump.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const isTransitioning = phase === "transitioning";
  // Idle plays the OLD level during transition so the destination never
  // ghosts through. Only swaps to `level` (== toLevel) once parent flips
  // phase back to idle.
  const idleLevel: DropletLevel =
    isTransitioning && fromLevel != null ? fromLevel : level;
  const idleName = LEVEL_NAME[idleLevel];
  const idleSrc = `/loreal/droplet-${idleName}-idle`;

  const transitionSrc =
    isTransitioning && fromLevel != null && toLevel != null
      ? `/loreal/droplet-${LEVEL_NAME[fromLevel]}-to-${LEVEL_NAME[toLevel]}`
      : null;

  return (
    <div className="relative" style={{ width }}>
      <TransparentVideoLoop
        key={`idle-${idleName}`}
        mp4Src={`${idleSrc}.mp4`}
        webmSrc={`${idleSrc}.webm`}
        width="100%"
        className="block"
      />
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

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

// While transitioning, only the transition clip is visible — the idle layer
// is hidden so the previous water level doesn't ghost through. The transition
// clip's last frame matches the next idle level (Higgsfield --end-image
// pinning), so the handoff is seamless.
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

  const isTransitioning = phase === "transitioning";

  return (
    <div className="relative" style={{ width }}>
      {/* Idle layer — hidden during transition (no ghost of previous level). */}
      <div style={{ visibility: isTransitioning ? "hidden" : "visible" }}>
        <TransparentVideoLoop
          key={`idle-${idleName}`}
          mp4Src={`${idleSrc}.mp4`}
          webmSrc={`${idleSrc}.webm`}
          width="100%"
          className="block"
        />
      </div>

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

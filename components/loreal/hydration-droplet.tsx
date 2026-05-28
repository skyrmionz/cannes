"use client";

import { useEffect, useRef, useState } from "react";
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
// - All 3 idle videos are mounted continuously and play in the background.
// - Visibility toggling decides which one shows (visible vs hidden).
// - During a transition, ALL idles are hidden — only the fill overlay is
//   visible. Nothing leaks through the fill's transparent glass top.
// - The fill overlay is mounted dynamically; we keep it visible for one extra
//   rAF after `onEnded` so the destination idle has time to flip to visible
//   and paint a frame before the fill disappears. No paint gap, no flash.
export function HydrationDroplet({
  width,
  level,
  phase,
  fromLevel: _fromLevel,
  toLevel,
  onTransitionEnd,
}: Props) {
  const isTransitioning = phase === "transitioning";

  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const overlayRef = useRef<HTMLVideoElement>(null);

  // When a new transition starts, mount the overlay with the fill clip and
  // start playback. Overlay stays mounted past the parent's phase=idle flip
  // (driven by the rAF below) so the transition video covers the destination
  // idle's first paint.
  useEffect(() => {
    if (isTransitioning && _fromLevel != null && toLevel != null) {
      const src = `/loreal/droplet-${LEVEL_NAME[_fromLevel]}-to-${LEVEL_NAME[toLevel]}`;
      setOverlaySrc(src);
      setOverlayVisible(true);
    }
  }, [isTransitioning, _fromLevel, toLevel]);

  // Restart the overlay video whenever its src changes.
  useEffect(() => {
    if (!overlaySrc) return;
    const v = overlayRef.current;
    if (!v) return;
    v.load();
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, [overlaySrc]);

  const handleEnded = () => {
    // Tell parent the transition is done — they'll set level=toLevel and
    // phase=idle, which makes the destination idle visible. We hold the
    // overlay visible for one extra animation frame so the new idle's
    // first paint lands while the fill is still on top, then unmount.
    onTransitionEnd?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlayVisible(false);
        // Tiny extra delay before unmounting so the freshly-painted idle
        // has been composited.
        setTimeout(() => setOverlaySrc(null), 60);
      });
    });
  };

  return (
    <div className="relative" style={{ width }}>
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

      {overlaySrc && (
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
            <source src={`${overlaySrc}.mp4`} type='video/mp4; codecs="hvc1"' />
            <source src={`${overlaySrc}.webm`} type="video/webm" />
          </video>
        </div>
      )}
    </div>
  );
}

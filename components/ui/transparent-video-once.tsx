"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One-shot transparent video. Plays once, fires onEnded, never loops.
 * HEVC+alpha (Safari) + VP9+alpha (Chrome/Firefox), same dual-source pattern
 * as TransparentVideoLoop.
 *
 * The `restartKey` prop forces a reload when changed — required so the same
 * src can replay on consecutive clicks. Without it the <video> stays at its
 * "ended" state.
 */
interface Props {
  mp4Src: string;
  webmSrc: string;
  width: number | string;
  restartKey?: string | number;
  onEnded?: () => void;
  className?: string;
  filter?: string;
}

export function TransparentVideoOnce({
  mp4Src,
  webmSrc,
  width,
  restartKey,
  onEnded,
  className,
  filter,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, [restartKey]);

  if (unsupported) return null;

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      onEnded={onEnded}
      onError={(e) => {
        const err = (e.currentTarget as HTMLVideoElement).error;
        if (err && err.code === 4) setUnsupported(true);
      }}
      className={className}
      style={{ width, height: "auto", filter }}
    >
      <source src={mp4Src} type='video/mp4; codecs="hvc1"' />
      <source src={webmSrc} type="video/webm" />
    </video>
  );
}

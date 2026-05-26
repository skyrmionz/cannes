"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Looping transparent video with HEVC+alpha (Safari) and VP9+alpha (Chrome/Firefox)
 * source pairing. Designed to survive Next.js client-side route transitions, where
 * naive <video autoPlay> often gets stuck on the poster frame.
 *
 * Key behaviors:
 *   - Force-plays on mount + on canplay (route transitions can swallow autoPlay).
 *   - `onError` only triggers fallback if the error is MEDIA_ERR_SRC_NOT_SUPPORTED
 *     (code 4) — i.e. the file actually doesn't decode. Transient aborts and
 *     decode hiccups are ignored.
 *   - Optional PNG fallback for the case where the file genuinely fails.
 */
interface Props {
  mp4Src: string;
  webmSrc: string;
  width: number | string;
  fallbackSrc?: string;
  fallbackAlt?: string;
  className?: string;
  filter?: string;
}

export function TransparentVideoLoop({
  mp4Src,
  webmSrc,
  width,
  fallbackSrc,
  fallbackAlt = "",
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
  }, []);

  if (unsupported && fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={fallbackAlt}
        width={typeof width === "number" ? width : 600}
        height={400}
        priority
        className={className}
        style={{ width, height: "auto", filter }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      // Only fall back if the file is genuinely undecodable. Other errors
      // (transient aborts, network blips on route change) shouldn't lock us out.
      onError={(e) => {
        const err = (e.currentTarget as HTMLVideoElement).error;
        if (err && err.code === 4 /* MEDIA_ERR_SRC_NOT_SUPPORTED */) {
          setUnsupported(true);
        }
      }}
      className={className}
      style={{ width, height: "auto", filter }}
    >
      {/* HEVC+alpha first — Safari grabs it; Chrome/Firefox fall through to WebM. */}
      <source src={mp4Src} type='video/mp4; codecs="hvc1"' />
      <source src={webmSrc} type="video/webm" />
    </video>
  );
}

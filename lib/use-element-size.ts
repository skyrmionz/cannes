"use client";

import { useEffect, useRef, useState } from "react";

// ResizeObserver hook — measures an element's contentRect and re-renders
// whenever its box changes. Used by scenes that need to scale raw-px math
// (sun stops, droplet width, etc.) to the actual size of their flex body
// rather than to viewport units, which don't account for the persistent
// glass card's `inset-3` padding.
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    // Seed with the current box in case the observer doesn't fire immediately.
    const rect = el.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

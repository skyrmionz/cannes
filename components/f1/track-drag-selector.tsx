"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { KnobOption } from "./knob-question-screen";

interface TrackDragSelectorProps {
  options: KnobOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TrackDragSelector({ options, selectedId, onSelect }: TrackDragSelectorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawPct, setRawPct] = useState<number | null>(null);

  const zonePcts = options.map((_, i) =>
    options.length === 1 ? 50 : (i / (options.length - 1)) * 100
  );

  const selectedIdx = options.findIndex((o) => o.id === selectedId);

  const carPct =
    isDragging && rawPct !== null
      ? rawPct
      : selectedIdx >= 0
      ? zonePcts[selectedIdx]
      : 50;

  const nearestZoneIdx = useCallback(
    (pct: number): number =>
      zonePcts.reduce(
        (best, zp, i) =>
          Math.abs(zp - pct) < Math.abs(zonePcts[best] - pct) ? i : best,
        0
      ),
    [zonePcts]
  );

  const pctFromPointer = (clientX: number): number => {
    if (!trackRef.current) return 50;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const pct = pctFromPointer(e.clientX);
      setIsDragging(true);
      setRawPct(pct);
      onSelect(options[nearestZoneIdx(pct)].id);
    },
    [nearestZoneIdx, onSelect, options]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const pct = pctFromPointer(e.clientX);
      setRawPct(pct);
      onSelect(options[nearestZoneIdx(pct)].id);
    },
    [isDragging, nearestZoneIdx, onSelect, options]
  );

  const commit = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const pct = pctFromPointer(e.clientX);
      const idx = nearestZoneIdx(pct);
      setIsDragging(false);
      setRawPct(null);
      onSelect(options[idx].id);
    },
    [isDragging, nearestZoneIdx, onSelect, options]
  );

  const showLabels = options.length <= 6;
  const selected = selectedIdx >= 0 ? options[selectedIdx] : null;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Selected option preview card */}
      <div className="mx-4" style={{ minHeight: 88 }}>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              className="flex items-center gap-3 rounded-xl border-2 border-white bg-white/20 p-3 backdrop-blur-sm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <OptionThumb option={selected} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase tracking-wide text-white">
                  {selected.label}
                </p>
                {(selected.subtitle ?? selected.drivers) && (
                  <p className="mt-0.5 text-[11px] text-white/60">
                    {selected.subtitle ?? selected.drivers}
                  </p>
                )}
                {selected.description && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/40">
                    {selected.description}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-3"
              style={{ minHeight: 88 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-white/30">Drag the car to choose</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag track */}
      <div
        ref={trackRef}
        className="relative mx-4 touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ height: showLabels ? 88 : 68 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={commit}
        onPointerCancel={commit}
      >
        {/* Track line */}
        <div className="pointer-events-none absolute inset-x-0 top-[30px] h-[2px] rounded-full bg-white/20" />

        {/* Zone markers */}
        {zonePcts.map((zp, i) => {
          const isSel = i === selectedIdx;
          return (
            <div
              key={options[i].id}
              className="pointer-events-none absolute"
              style={{ left: `${zp}%`, top: "22px", transform: "translateX(-50%)" }}
            >
              <div
                className={`rounded-full transition-all duration-200 ${
                  isSel ? "h-5 w-5 bg-white" : "h-4 w-4 bg-white/25"
                }`}
                style={isSel ? { margin: "-2px" } : undefined}
              />
              {showLabels && (
                <p
                  className={`mt-1.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide ${
                    isSel ? "text-white" : "text-white/35"
                  }`}
                  style={{ width: "40px", marginLeft: "-12px" }}
                >
                  {shortLabel(options[i])}
                </p>
              )}
            </div>
          );
        })}

        {/* Fader thumb */}
        <motion.div
          className="pointer-events-none absolute"
          style={{ top: "6px" }}
          animate={{ left: `${carPct}%` }}
          transition={
            isDragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 480, damping: 32 }
          }
        >
          <div style={{ transform: "translateX(-50%)" }}>
            <F1CarSVG />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function shortLabel(option: KnobOption): string {
  const words = option.label.split(" ");
  const first = words[0];
  return first.length > 7 ? first.slice(0, 7) : first;
}

function OptionThumb({ option, size }: { option: KnobOption; size: number }) {
  const dim = { width: size, height: size };
  const invert = ["mercedes", "aston-martin", "audi", "cadillac"].includes(option.id);

  if (option.logo) {
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-white/10" style={dim}>
        <Image
          src={option.logo}
          alt={option.label}
          fill
          unoptimized
          className={`object-contain p-1 ${invert ? "brightness-0 invert" : ""}`}
        />
      </div>
    );
  }
  if (option.emoji) {
    return (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-3xl"
        style={dim}
      >
        {option.emoji}
      </div>
    );
  }
  if (option.image) {
    return (
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-white/10" style={dim}>
        <Image src={option.image} alt={option.label} fill unoptimized className="object-cover" />
      </div>
    );
  }
  return <div className="flex-shrink-0 rounded-lg bg-white/10" style={dim} />;
}

function F1CarSVG() {
  // White rectangle thumb — matches Figma "Music" fader design
  return (
    <div
      style={{
        width: 28,
        height: 48,
        borderRadius: 6,
        background: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
      }}
    />
  );
}

"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { useElementSize } from "@/lib/use-element-size";

// Re-export the shape that agenda-question-screen.tsx expects so the
// 3D component is a drop-in replacement for the CSS CalendarColumn.
export type Slot = {
  start: number;
  end: number;
  title: string;
  hue: number;
};

export type AgendaIndex = 0 | 1 | 2 | 3;

interface Props {
  index: AgendaIndex | null;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  dayStart: number;
  dayEnd: number;
  slotCount?: number;
}

const DEFAULT_SLOT_COUNT = 5;
const HOUR_UNITS = 1;
const TILE_GAP = 0.06;
const TILE_DEPTH = 0.5; // deeper for proper refraction sampling
const TILE_RADIUS = 0.08;
// Extra world-space padding above and below the calendar so tiles
// can spawn off-screen and full-day blocks don't kiss the canvas edge.
const WORLD_MARGIN = 0.6;

const SPAWN_STAGGER_S = 0.2;
const ENTRY_DELAY_S = 0.06;
const SPAWN_OFFSCREEN_BUFFER = 1.5;
const FALL_GRAVITY = 175;

function hueToColor(hue: number, lightness = 0.6): THREE.Color {
  return new THREE.Color().setHSL(hue / 360, 0.85, lightness);
}

type TilePhase = "idle" | "falling" | "squash" | "rest";

interface TileFrameHandle {
  advance: (dt: number) => void;
  getPhase: () => TilePhase;
}

interface TileProps {
  slot: Slot;
  slotIndex: number;
  totalSlots: number;
  slotCount: number;
  pxPerHour: number;
  worldWidth: number;
  worldYTop: number;
  restTopY: number;
  resetKey: string;
  registerTile: (handle: TileFrameHandle) => () => void;
}

function GlassTile({
  slot,
  slotIndex,
  totalSlots,
  slotCount,
  pxPerHour,
  worldWidth,
  worldYTop,
  restTopY,
  registerTile,
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tileHeight =
    ((slot.end - slot.start) / 2) * HOUR_UNITS - TILE_GAP;
  const restCenterY = restTopY - tileHeight / 2;
  const spawnY =
    worldYTop + SPAWN_OFFSCREEN_BUFFER + tileHeight / 2;

  const phaseRef = useRef<TilePhase>("idle");
  const timeRef = useRef(0);
  const yRef = useRef(spawnY);
  const vyRef = useRef(0);
  const scaleYRef = useRef(1);
  const scaleXRef = useRef(1);

  useLayoutEffect(() => {
    phaseRef.current = "idle";
    timeRef.current = 0;
    yRef.current = spawnY;
    vyRef.current = 0;
    scaleYRef.current = 1;
    scaleXRef.current = 1;
    if (groupRef.current) {
      groupRef.current.position.y = yRef.current;
      groupRef.current.visible = false;
      groupRef.current.scale.set(1, 1, 1);
    }
  }, [restCenterY, spawnY, slot.start, slot.end, slotIndex]);

  // Frame advance closure — invoked by the parent CalendarScene's
  // single useFrame. Each tile reports its own phase; parent decides
  // whether to keep the canvas redrawing.
  const advance = useCallback(
    (dt: number) => {
      const g = groupRef.current;
      if (!g) return;
      timeRef.current += dt;
      const reverseIndex = totalSlots - 1 - slotIndex;
      const startAt = ENTRY_DELAY_S + reverseIndex * SPAWN_STAGGER_S;

      if (phaseRef.current === "idle") {
        if (timeRef.current >= startAt) {
          phaseRef.current = "falling";
          vyRef.current = 0;
          g.visible = true;
        }
      } else if (phaseRef.current === "falling") {
        vyRef.current -= FALL_GRAVITY * dt;
        yRef.current += vyRef.current * dt;
        if (yRef.current <= restCenterY) {
          yRef.current = restCenterY;
          phaseRef.current = "squash";
          timeRef.current = 0;
          vyRef.current = 0;
        }
      } else if (phaseRef.current === "squash") {
        const t = Math.min(1, timeRef.current / 0.28);
        let sy = 1;
        let sx = 1;
        if (t < 0.35) {
          const k = t / 0.35;
          sy = 1 - 0.18 * k;
          sx = 1 + 0.12 * k;
        } else if (t < 0.7) {
          const k = (t - 0.35) / 0.35;
          sy = 0.82 + 0.26 * k;
          sx = 1.12 - 0.16 * k;
        } else {
          const k = (t - 0.7) / 0.3;
          sy = 1.08 - 0.08 * k;
          sx = 0.96 + 0.04 * k;
        }
        scaleYRef.current = sy;
        scaleXRef.current = sx;
        if (t >= 1) {
          phaseRef.current = "rest";
          scaleYRef.current = 1;
          scaleXRef.current = 1;
        }
      }

      g.position.y = yRef.current;
      g.scale.y = scaleYRef.current;
      g.scale.x = scaleXRef.current;
    },
    [restCenterY, slotIndex, totalSlots],
  );

  const getPhase = useCallback(() => phaseRef.current, []);

  // Register/unregister with the parent each render so the parent
  // sees a stable list of currently-mounted tiles. Cleanup runs on
  // unmount or before re-register.
  useLayoutEffect(() => {
    const cleanup = registerTile({ advance, getPhase });
    return cleanup;
  }, [registerTile, advance, getPhase]);

  const tintColor = useMemo(() => hueToColor(slot.hue, 0.62), [slot.hue]);
  const isFullDay = slot.end - slot.start >= slotCount * 2;

  // Text overlay sizing in CSS pixels.
  const textBoxWidthPx = Math.max(0, worldWidth * pxPerHour);
  // tileHeight is in "rows" of HOUR_UNITS — convert to px via pxPerHour.
  const textBoxHeightPx = Math.max(0, tileHeight * pxPerHour);
  const titlePxSize = isFullDay
    ? Math.max(28, Math.min(textBoxHeightPx * 0.32, 84))
    : Math.max(14, Math.min(textBoxHeightPx * 0.42, 26));
  const timeLabelPxSize = Math.max(
    11,
    Math.min(textBoxHeightPx * 0.32, 20),
  );

  const timeLabel = `${String(slot.start).padStart(2, "0")}:00`;

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[worldWidth, tileHeight, TILE_DEPTH]}
        radius={TILE_RADIUS}
        smoothness={5}
      >
        {/* Cheaper, calmer translucent material. MeshTransmissionMaterial
            was driving the neon look + a per-frame backbuffer pass;
            MeshPhysicalMaterial gives a clean tinted glass without the
            extra render target. */}
        <meshPhysicalMaterial
          color={tintColor}
          transmission={0.85}
          thickness={1.2}
          ior={1.4}
          roughness={0.25}
          metalness={0}
          transparent={true}
          opacity={0.78}
          clearcoat={0.35}
          clearcoatRoughness={0.2}
          attenuationColor={tintColor}
          attenuationDistance={2.5}
        />
      </RoundedBox>

      {/* Text overlay — DOM via drei <Html>, inherits page font, no
          outline. */}
      <Html
        position={[0, 0, TILE_DEPTH / 2 + 0.001]}
        center
        zIndexRange={[10, 0]}
        style={{
          pointerEvents: "none",
          width: textBoxWidthPx,
          height: textBoxHeightPx,
          display: "flex",
          alignItems: "center",
          justifyContent: isFullDay ? "center" : "flex-start",
          paddingInline: isFullDay ? 16 : 22,
          color: "#FFFFFF",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 700,
          letterSpacing: isFullDay ? "-0.02em" : "-0.005em",
          textShadow: isFullDay
            ? "0 2px 14px rgba(0,16,80,0.45)"
            : "0 1px 6px rgba(0,16,80,0.4)",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {!isFullDay && (
          <span
            style={{
              fontSize: timeLabelPxSize,
              fontWeight: 700,
              opacity: 0.92,
              marginRight: 14,
              flexShrink: 0,
            }}
          >
            {timeLabel}
          </span>
        )}
        <span
          style={{
            fontSize: titlePxSize,
            fontWeight: 800,
            flex: 1,
            textAlign: isFullDay ? "center" : "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {slot.title}
        </span>
      </Html>
    </group>
  );
}

function CalendarScene({
  index,
  schedules,
  pxPerHour,
  slotCount,
}: {
  index: AgendaIndex | null;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  pxPerHour: number;
  slotCount: number;
}) {
  const { viewport, invalidate } = useThree();
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (slotCount * HOUR_UNITS) / 2;

  const slots = index === null ? [] : schedules[index];
  const totalSlots = slots.length;

  // Tile registry — each GlassTile registers a frame handle on mount,
  // unregisters on unmount. CalendarScene runs the only useFrame.
  const tilesRef = useRef<Set<TileFrameHandle>>(new Set());
  const registerTile = useCallback((handle: TileFrameHandle) => {
    tilesRef.current.add(handle);
    // First registration after an index change kicks the canvas into
    // rendering at least one frame so the spawn animation can start.
    invalidate();
    return () => {
      tilesRef.current.delete(handle);
    };
  }, [invalidate]);

  // Kick a render whenever the selection changes so any new tiles get
  // a chance to start their entry animation even if the canvas was
  // previously parked in "rest".
  useLayoutEffect(() => {
    invalidate();
  }, [index, invalidate]);

  useFrame((_, dt) => {
    let anyActive = false;
    tilesRef.current.forEach((tile) => {
      tile.advance(dt);
      const phase = tile.getPhase();
      if (phase !== "rest") anyActive = true;
    });
    // While any tile is still falling/squashing, keep requesting
    // frames. Once everything's at rest the canvas parks itself.
    if (anyActive) invalidate();
  });

  // Slot.start ∈ {9, 11, 13, 15, 17}. Each slot occupies 1 row of
  // HOUR_UNITS height in world space; the (start - 9) / 2 mapping
  // turns the clock value into a row index 0..(slotCount-1).
  return (
    <>
      {/* Two Lightformers — top key + front fill. Side rims dropped
          to halve the env-map cost. */}
      <Environment background={false} resolution={128}>
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffffff"
          position={[0, 8, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ffffff"
          position={[0, 0, 7]}
          rotation={[0, 0, 0]}
          scale={[12, 8, 1]}
        />
      </Environment>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[1.5, 6, 5]}
        intensity={1.1}
        color="#ffffff"
      />
      {slots.map((slot, i) => {
        const rowIndex = (slot.start - 9) / 2;
        const restTopY =
          worldYTop - rowIndex * HOUR_UNITS - TILE_GAP / 2;
        return (
          <GlassTile
            key={`${index}-${slot.start}-${slot.end}`}
            slot={slot}
            slotIndex={i}
            totalSlots={totalSlots}
            slotCount={slotCount}
            pxPerHour={pxPerHour}
            worldWidth={worldWidth}
            worldYTop={worldYTop}
            restTopY={restTopY}
            resetKey={`${index}-${slot.start}-${slot.end}`}
            registerTile={registerTile}
          />
        );
      })}
    </>
  );
}

export function CalendarColumn3D({
  index,
  schedules,
  dayStart,
  dayEnd,
  slotCount = DEFAULT_SLOT_COUNT,
}: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const measuredH = size.h || 0;
  // pxPerHour now means "px per slot row" — slotCount rows fill the
  // visible body height.
  const pxPerHour = Math.max(1, Math.floor(measuredH / slotCount));

  // Camera frames slotCount + 2*WORLD_MARGIN so full-day tiles never
  // touch the visible top/bottom edges. Computed zoom keeps the
  // pxPerHour used for tile/text math correct.
  const orthoHeight = slotCount * HOUR_UNITS + WORLD_MARGIN * 2;

  // Slot-row labels: 9, 11, 13, 15, 17 for the default 5-slot layout.
  const slotInterval = (dayEnd - dayStart) / slotCount;

  return (
    // overflow: visible so the canvas (which extends past the body for
    // off-screen tile spawns) doesn't get clipped at the rounded card edge.
    <div ref={ref} className="relative h-full w-full">
      {/* Empty hour-slot containers when nothing's selected. */}
      {index === null && pxPerHour > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: slotCount }).map((_, i) => {
            const hour = dayStart + i * slotInterval;
            const label = `${String(hour).padStart(2, "0")}:00`;
            return (
              <div
                key={`guide-${i}`}
                className="absolute inset-x-0"
                style={{
                  top: i * pxPerHour,
                  height: pxPerHour - 4,
                  borderRadius: 18,
                  background: "transparent",
                  boxShadow: "0 0 0 1px rgba(0,16,80,0.12) inset",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 16,
                    color: "rgba(0,16,80,0.45)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {size.w > 0 && size.h > 0 && (
        <Canvas
          orthographic
          frameloop="demand"
          camera={{
            position: [0, 0, 5],
            zoom: measuredH / orthoHeight,
            near: 0.1,
            far: 50,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          style={{ background: "transparent" }}
        >
          <CalendarScene
            index={index}
            schedules={schedules}
            pxPerHour={pxPerHour}
            slotCount={slotCount}
          />
        </Canvas>
      )}
    </div>
  );
}

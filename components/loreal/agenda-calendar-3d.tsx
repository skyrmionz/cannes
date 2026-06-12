"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  MeshTransmissionMaterial,
  Preload,
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
const TILE_RADIUS = 0.22;
// Extra world-space padding above and below the calendar so tiles
// can spawn off-screen and full-day blocks don't kiss the canvas edge.
const WORLD_MARGIN = 0.6;

const SPAWN_STAGGER_S = 0.2;
const ENTRY_DELAY_S = 0.06;
const SPAWN_OFFSCREEN_BUFFER = 1.5;
const FALL_GRAVITY = 175;

function hueToColor(hue: number, lightness = 0.62): THREE.Color {
  // Vibrant pastel — enough saturation + mid lightness so text on
  // top stays readable while the tile still reads as colorful glass.
  return new THREE.Color().setHSL(hue / 360, 0.8, lightness);
}

type TilePhase = "idle" | "falling" | "squash" | "rest" | "exiting";

interface TileFrameHandle {
  advance: (dt: number) => void;
  getPhase: () => TilePhase;
}

interface TileProps {
  slot: Slot;
  slotIndex: number;
  totalSlots: number;
  slotCount: number;
  // CSS pixels per world unit (camera zoom) — used to size the DOM
  // text overlay so it matches the rendered tile bounds exactly.
  pxPerWorldUnit: number;
  worldWidth: number;
  worldYTop: number;
  restTopY: number;
  resetKey: string;
  registerTile: (handle: TileFrameHandle) => () => void;
  exiting?: boolean;
}

function GlassTile({
  slot,
  slotIndex,
  totalSlots,
  slotCount,
  pxPerWorldUnit,
  worldWidth,
  worldYTop,
  restTopY,
  registerTile,
  exiting = false,
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

  const opacityRef = useRef(1);

  useLayoutEffect(() => {
    phaseRef.current = "idle";
    timeRef.current = 0;
    yRef.current = spawnY;
    vyRef.current = 0;
    scaleYRef.current = 1;
    scaleXRef.current = 1;
    opacityRef.current = 1;
    if (groupRef.current) {
      groupRef.current.position.y = yRef.current;
      groupRef.current.visible = false;
      groupRef.current.scale.set(1, 1, 1);
    }
  }, [restCenterY, spawnY, slot.start, slot.end, slotIndex]);

  // When the exiting prop flips to true, switch ANY visible tile to
  // "exiting" regardless of its current phase (rest, squash, falling,
  // or even idle). This ensures ALL tiles animate out when the user
  // picks a new status — even tiles that are still mid-entry.
  const prevExitingRef = useRef(false);
  useLayoutEffect(() => {
    if (exiting && !prevExitingRef.current) {
      const phase = phaseRef.current;
      if (phase !== "exiting") {
        phaseRef.current = "exiting";
        // If the tile was hidden (idle, hasn't spawned yet), make it
        // visible so the exit animation shows it briefly falling out.
        if (groupRef.current && !groupRef.current.visible) {
          groupRef.current.visible = true;
          yRef.current = restCenterY; // start from rest position
        }
        vyRef.current = 0;
        timeRef.current = 0;
        opacityRef.current = 1;
      }
    }
    prevExitingRef.current = exiting;
  }, [exiting, restCenterY]);

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
      } else if (phaseRef.current === "exiting") {
        // Staggered exit: top slot (index 0) exits first, bottom last.
        // Each tile waits slotIndex * 0.06s before starting to fall.
        const exitDelay = slotIndex * 0.06;
        if (timeRef.current < exitDelay) {
          // Waiting for stagger — hold position
        } else {
          // Accelerate downward + fade out
          vyRef.current -= FALL_GRAVITY * 1.8 * dt;
          yRef.current += vyRef.current * dt;
          opacityRef.current = Math.max(0, opacityRef.current - dt * 3.5);
        }
        // Once well below the screen, mark as done
        if (yRef.current < -(worldYTop * 2)) {
          phaseRef.current = "rest";
          g.visible = false;
        }
      }

      g.position.y = yRef.current;
      g.scale.y = scaleYRef.current;
      g.scale.x = scaleXRef.current;
      // Apply opacity for exit fade
      if (phaseRef.current === "exiting") {
        g.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.Material;
            if (mat) {
              mat.transparent = true;
              mat.opacity = opacityRef.current;
            }
          }
        });
      }
    },
    [restCenterY, slotIndex, totalSlots, worldYTop],
  );

  const getPhase = useCallback(() => phaseRef.current, []);

  // Register/unregister with the parent each render so the parent
  // sees a stable list of currently-mounted tiles. Cleanup runs on
  // unmount or before re-register.
  useLayoutEffect(() => {
    const cleanup = registerTile({ advance, getPhase });
    return cleanup;
  }, [registerTile, advance, getPhase]);

  const tintColor = useMemo(() => hueToColor(slot.hue, 0.6), [slot.hue]);
  const isFullDay = slot.end - slot.start >= slotCount * 2;

  // Text overlay sizing in CSS pixels — must match the rendered tile
  // mesh, which is `worldWidth × tileHeight` in world units. Multiply
  // both by the camera's px-per-world-unit so the DOM overlay box
  // exactly fits the tile (no left-side bleed).
  const textBoxWidthPx = Math.max(0, worldWidth * pxPerWorldUnit);
  const textBoxHeightPx = Math.max(0, tileHeight * pxPerWorldUnit);
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
      {/* Slight rotation reveals the top face + a sliver of the
          right side of each tile, so the cubes read as 3D objects.
          Outer groupRef drives y-position + scale (drop physics);
          this inner rotated group only affects geometry orientation. */}
      <group rotation={[-0.22, 0.18, 0]}>
        <RoundedBox
          args={[worldWidth, tileHeight, TILE_DEPTH]}
          radius={TILE_RADIUS}
          smoothness={8}
        >
          {/* Based on drei's "Gelatinous Cube" storybook demo, with
              three deliberate departures for our case:
              1) background → bright white instead of the demo's sage
                 #839681. Sage was muddying our slot hues; white lets
                 the saturated tint read clean and vibrant.
              2) attenuationDistance → 1.4 (was 0.5). Longer distance
                 = paler interior = brighter, less inky tint.
              3) iridescence + iridescenceIOR — the demo doesn't use
                 these, but MeshTransmissionMaterial extends
                 MeshPhysicalMaterial so the props pass through. Adds
                 the colored sheen the user asked for.
              4) samples 10 → 6, resolution 1024 → 512. Halves the
                 first-paint compile cost and the per-frame transmission
                 sampler size — main cause of the click-then-lag delay.
                 At our tile size the visual difference is invisible. */}
          <MeshTransmissionMaterial
            color={tintColor}
            background={new THREE.Color("#ffffff")}
            backside={false}
            samples={1}
            resolution={128}
            transmission={1}
            roughness={0.02}
            thickness={3.5}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.1}
            distortion={0.0}
            distortionScale={0.3}
            temporalDistortion={0.3}
            clearcoat={1}
            attenuationDistance={2.0}
            attenuationColor={tintColor}
            iridescence={0.5}
            iridescenceIOR={1.3}
          />
        </RoundedBox>
      </group>

      {/* Text overlay — DOM via drei <Html>, inherits page font, no
          outline. Stays at the outer (un-rotated) group so text
          renders flat-on regardless of the cube tilt. */}
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

const EXIT_DURATION_MS = 500;

function CalendarScene({
  index,
  schedules,
  pxPerWorldUnit,
  slotCount,
}: {
  index: AgendaIndex | null;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  pxPerWorldUnit: number;
  slotCount: number;
}) {
  const { viewport, invalidate } = useThree();
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (slotCount * HOUR_UNITS) / 2;

  // displayedIndex lags behind index by EXIT_DURATION_MS so old tiles
  // can play their exit animation before new tiles mount.
  const [displayedIndex, setDisplayedIndex] = useState<AgendaIndex | null>(index);
  const [isExiting, setIsExiting] = useState(false);
  const prevIndexRef = useRef<AgendaIndex | null>(index);

  useEffect(() => {
    if (index === prevIndexRef.current) return;
    const hadPrev = prevIndexRef.current !== null;
    prevIndexRef.current = index;

    if (hadPrev) {
      // Start exit animation on old tiles
      setIsExiting(true);
      invalidate();
      const timer = setTimeout(() => {
        setIsExiting(false);
        setDisplayedIndex(index);
      }, EXIT_DURATION_MS);
      return () => clearTimeout(timer);
    } else {
      // First selection — no exit needed, mount immediately
      setDisplayedIndex(index);
    }
  }, [index, invalidate]);

  const slots = displayedIndex === null ? [] : schedules[displayedIndex];
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

  // Kick a render whenever the selection changes so any new tiles
  // get a chance to start their entry animation even if the canvas
  // was previously parked in "rest". Also runs on first mount with
  // index === null so the shader warm-up tile compiles its programs
  // before the user's first click.
  useLayoutEffect(() => {
    invalidate();
  }, [displayedIndex, invalidate]);

  useFrame((_, dt) => {
    let anyActive = false;
    tilesRef.current.forEach((tile) => {
      tile.advance(dt);
      const phase = tile.getPhase();
      if (phase !== "rest") anyActive = true;
    });
    // While any tile is still falling/squashing/exiting, keep requesting
    // frames. Once everything's at rest the canvas parks itself.
    if (anyActive || isExiting) invalidate();
  });

  // Slot.start ∈ {9, 11, 13, 15, 17}. Each slot occupies 1 row of
  // HOUR_UNITS height in world space; the (start - 9) / 2 mapping
  // turns the clock value into a row index 0..(slotCount-1).
  return (
    <>
      {/* Lightformer-based environment — no network fetch, renders
          instantly. Provides the reflections the clearcoat + transmission
          need to shimmer. */}
      <Environment background={false} resolution={128}>
        <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 8, 4]} rotation={[-Math.PI / 2, 0, 0]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 0, 7]} rotation={[0, 0, 0]} scale={[12, 8, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffe8d6" position={[0, -6, 4]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 4, 1]} />
      </Environment>
      <ambientLight intensity={Math.PI} />
      {slots.map((slot, i) => {
        const rowIndex = (slot.start - 9) / 2;
        const restTopY =
          worldYTop - rowIndex * HOUR_UNITS - TILE_GAP / 2;
        return (
          <GlassTile
            key={`${displayedIndex}-${slot.start}-${slot.end}`}
            slot={slot}
            slotIndex={i}
            totalSlots={totalSlots}
            slotCount={slotCount}
            pxPerWorldUnit={pxPerWorldUnit}
            worldWidth={worldWidth}
            worldYTop={worldYTop}
            restTopY={restTopY}
            resetKey={`${displayedIndex}-${slot.start}-${slot.end}`}
            registerTile={registerTile}
            exiting={isExiting}
          />
        );
      })}

      {/* Shader warm-up — when no status is selected, mount a
          1px-tiny mesh far behind the camera with the same
          MeshTransmissionMaterial config. This forces the shader
          to compile + allocate the transmission render target on
          mount, so the user's first circle tap doesn't pay that
          cost. Invisible because it's tiny + behind the camera. */}
      {displayedIndex === null && (
        <mesh position={[0, 0, -10]} scale={0.01}>
          <boxGeometry args={[1, 1, 1]} />
          <MeshTransmissionMaterial
            background={new THREE.Color("#ffffff")}
            backside={false}
            samples={1}
            resolution={128}
            transmission={1}
            roughness={0.02}
            thickness={3.5}
            ior={1.5}
            clearcoat={1}
            attenuationDistance={2.0}
          />
        </mesh>
      )}

      <Preload all />
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
  // pxPerHour drives the empty-state guide rows — they fill the
  // visible body height, slotCount rows of equal height.
  const pxPerHour = Math.max(1, Math.floor(measuredH / slotCount));

  // Camera frames slotCount + 2*WORLD_MARGIN so full-day tiles never
  // touch the visible top/bottom edges.
  const orthoHeight = slotCount * HOUR_UNITS + WORLD_MARGIN * 2;
  // CSS pixels per world unit — matches the orthographic camera zoom
  // exactly, so DOM overlays sized in px line up with mesh sizes
  // expressed in world units.
  const pxPerWorldUnit = Math.max(1, measuredH / orthoHeight);

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
          frameloop="always"
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
            toneMappingExposure: 1.15,
          }}
          style={{ background: "transparent" }}
        >
          <CalendarScene
            index={index}
            schedules={schedules}
            pxPerWorldUnit={pxPerWorldUnit}
            slotCount={slotCount}
          />
        </Canvas>
      )}
    </div>
  );
}

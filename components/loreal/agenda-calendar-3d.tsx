"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
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
}

// Each slot is rendered in 3D world units. We pick a comfortable
// internal scale and let the orthographic camera frame it.
const HOURS = 10;
// World-space height for one hour. Tiles are a fraction of this.
const HOUR_UNITS = 1;
const TILE_GAP = 0.06; // vertical gap between adjacent tiles
const TILE_DEPTH = 0.18;
const TILE_RADIUS = 0.07;

// Stagger between consecutive tile drops. Long enough that the
// previous tile lands before the next spawns. Tuned with FALL_GRAVITY
// so the total Packed sequence wraps in ~2s.
const SPAWN_STAGGER_S = 0.2;
const ENTRY_DELAY_S = 0.06;
// Buffer above the visible canvas top so tiles spawn off-screen and
// look like they're entering from above the calendar.
const SPAWN_OFFSCREEN_BUFFER = 1.5;
// Gravity in world-units / s².
const FALL_GRAVITY = 175;

// Convert a slot's hue (0-360) to an HSL THREE.Color tuned for the
// transmission material's color slot. Saturation/lightness matched to
// the previous CSS gradient stops.
function hueToColor(hue: number, lightness = 0.62): THREE.Color {
  return new THREE.Color().setHSL(hue / 360, 0.75, lightness);
}

interface TileProps {
  slot: Slot;
  slotIndex: number; // 0..schedule.length-1
  totalSlots: number; // schedule length, for reverse-stagger math
  pxPerHour: number; // for sizing text relative to viewport
  worldWidth: number; // tile X extent in world units
  worldYTop: number; // y of top of the calendar in world units
  // The slot's resting top edge in world units (already accounts for
  // start hour relative to DAY_START).
  restTopY: number;
  resetKey: string; // changes when agenda index flips, forces remount
}

function GlassTile({
  slot,
  slotIndex,
  totalSlots,
  pxPerHour,
  worldWidth,
  worldYTop,
  restTopY,
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const tileHeight = (slot.end - slot.start) * HOUR_UNITS - TILE_GAP;
  const restCenterY = restTopY - tileHeight / 2;
  // Spawn ABOVE the canvas top edge so the tile looks like it's
  // entering from above the calendar. Half the tile is above the
  // top so even the top-of-day slot has visible travel distance.
  const spawnY =
    worldYTop + SPAWN_OFFSCREEN_BUFFER + tileHeight / 2;

  // Drop simulation state held in refs so we don't re-render every
  // frame — useFrame mutates the group transform directly.
  const phaseRef = useRef<"idle" | "falling" | "squash" | "rest">("idle");
  const timeRef = useRef(0);
  const yRef = useRef(spawnY);
  const vyRef = useRef(0);
  const scaleYRef = useRef(1);
  const scaleXRef = useRef(1);

  // Reset BEFORE first paint so the tile spawns at spawnY (above the
  // visible canvas), not popping in at rest. useLayoutEffect runs
  // synchronously after DOM mutation, before the browser paints.
  useLayoutEffect(() => {
    phaseRef.current = "idle";
    timeRef.current = 0;
    yRef.current = spawnY;
    vyRef.current = 0;
    scaleYRef.current = 1;
    scaleXRef.current = 1;
    if (groupRef.current) {
      groupRef.current.position.y = yRef.current;
      // Hide until the spawn-stagger window opens so the tile doesn't
      // visibly sit above the calendar before its drop begins.
      groupRef.current.visible = false;
      groupRef.current.scale.set(1, 1, 1);
    }
  }, [restCenterY, spawnY, slot.start, slot.end, slotIndex]);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    timeRef.current += dt;
    // Bottom slot (latest hour, highest array index) drops FIRST,
    // top slot drops last. Stagger index reversed.
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
      // 280ms 2-axis squash + bounce — squishy jelly impact.
      const t = Math.min(1, timeRef.current / 0.28);
      // Vertical: compress, overshoot, settle.
      let sy = 1;
      // Horizontal: expand inversely so it reads as squishy
      // (volume conservation), settle.
      let sx = 1;
      if (t < 0.35) {
        const k = t / 0.35;
        sy = 1 - 0.16 * k;
        sx = 1 + 0.1 * k;
      } else if (t < 0.7) {
        const k = (t - 0.35) / 0.35;
        sy = 0.84 + 0.22 * k;
        sx = 1.1 - 0.13 * k;
      } else {
        const k = (t - 0.7) / 0.3;
        sy = 1.06 - 0.06 * k;
        sx = 0.97 + 0.03 * k;
      }
      scaleYRef.current = sy;
      scaleXRef.current = sx;
      if (t >= 1) {
        phaseRef.current = "rest";
        scaleYRef.current = 1;
        scaleXRef.current = 1;
      }
    }
    // No idle breathing — tiles stay still after landing.

    g.position.y = yRef.current;
    g.scale.y = scaleYRef.current;
    g.scale.x = scaleXRef.current;
  });

  const tintColor = useMemo(() => hueToColor(slot.hue, 0.62), [slot.hue]);
  const tintColorBright = useMemo(
    () => hueToColor(slot.hue, 0.78),
    [slot.hue],
  );
  const isFullDay = slot.end - slot.start >= HOURS;

  // Text overlay sizing in CSS pixels. Orthographic camera zoom puts
  // 1 world unit = pxPerHour CSS pixels, so the tile measures
  // worldWidth*pxPerHour by tileHeight*pxPerHour pixels on screen.
  const textBoxWidthPx = Math.max(0, worldWidth * pxPerHour);
  const textBoxHeightPx = Math.max(0, tileHeight * pxPerHour);
  const titlePxSize = isFullDay
    ? Math.max(28, Math.min(textBoxHeightPx * 0.32, 84))
    : Math.max(14, Math.min(textBoxHeightPx * 0.42, 26));
  const timeLabelPxSize = Math.max(
    11,
    Math.min(textBoxHeightPx * 0.32, 20),
  );

  // Time label in HH:MM.
  const timeLabel = `${String(slot.start).padStart(2, "0")}:00`;

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        <RoundedBox
          args={[worldWidth, tileHeight, TILE_DEPTH]}
          radius={TILE_RADIUS}
          smoothness={5}
        >
          {/* Slime / squishy gel material:
              - High transmission (0.92) so light passes through and
                the tile reads as see-through, not painted.
              - Thick volume + short attenuation distance: the slot's
                hue stains the light passing through.
              - Low emissive (0.18) gives a soft inner glow without
                the "neon" overshoot the prior version had.
              - Clearcoat + Lightformer reflections give the wet
                glossy surface highlights that sell "slime". */}
          <meshPhysicalMaterial
            color={tintColor}
            emissive={tintColor}
            emissiveIntensity={0.18}
            transparent
            opacity={0.95}
            transmission={0.92}
            thickness={2.0}
            ior={1.4}
            roughness={0.08}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.03}
            iridescence={0.25}
            iridescenceIOR={1.35}
            attenuationColor={tintColor}
            attenuationDistance={0.9}
            specularIntensity={1}
            sheen={0.3}
            sheenRoughness={0.3}
            sheenColor={tintColorBright}
            envMapIntensity={1.8}
          />
        </RoundedBox>

      </group>

      {/* Text overlay — drei <Html> in screen-space mode projects
          this DOM at the 3D position. Inherits the page's font stack
          (system-ui, same as question text). No outline; white with
          a soft navy drop-shadow for legibility on any hue. */}
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
            ? "0 2px 14px rgba(0,16,80,0.4)"
            : "0 1px 6px rgba(0,16,80,0.35)",
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
}: {
  index: AgendaIndex | null;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  pxPerHour: number;
}) {
  const { viewport } = useThree();
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (HOURS * HOUR_UNITS) / 2;

  // Null-state: render the env + lights but no tiles, so WebGL is
  // already warmed up by the time the user picks a status.
  const slots = index === null ? [] : schedules[index];

  // Number of slots in current schedule, for reverse-stagger math
  // (bottom slot drops first, top slot drops last).
  const totalSlots = slots.length;

  return (
    <>
      {/* Environment with custom Lightformer rectangles. Lightformers
          are pure WebGL light planes that the material's clearcoat /
          iridescence / specular reflections pick up — no external HDR
          fetch, guaranteed to render. This is what gives each tile a
          clean glossy highlight sweep across the top, the way product
          renders look. */}
      <Environment background={false} resolution={256}>
        {/* Big top-down white plane — primary specular sweep across
            the top of every tile. */}
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffffff"
          position={[0, 8, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 4, 1]}
        />
        {/* Side rims for edge highlights. */}
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#fff7e0"
          position={[-6, 2, 3]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#dceeff"
          position={[6, 2, 3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[6, 6, 1]}
        />
        {/* Front fill so the iridescence doesn't go too dark in the
            tile interior. */}
        <Lightformer
          form="rect"
          intensity={1}
          color="#ffffff"
          position={[0, 0, 7]}
          rotation={[0, 0, 0]}
          scale={[12, 8, 1]}
        />
      </Environment>
      {/* Diffuse ambient + key for the diffuse channel. Lightformers
          drive reflections; these drive shading. */}
      <ambientLight intensity={1.1} />
      <directionalLight
        position={[1.5, 6, 5]}
        intensity={1.2}
        color="#ffffff"
      />
      {slots.map((slot, i) => {
        const restTopY =
          worldYTop - (slot.start - 9) * HOUR_UNITS - TILE_GAP / 2;
        return (
          <GlassTile
            key={`${index}-${slot.start}-${slot.end}`}
            slot={slot}
            slotIndex={i}
            totalSlots={totalSlots}
            pxPerHour={pxPerHour}
            worldWidth={worldWidth}
            worldYTop={worldYTop}
            restTopY={restTopY}
            resetKey={`${index}-${slot.start}-${slot.end}`}
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
}: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const measuredH = size.h || 0;
  const pxPerHour = Math.max(1, Math.floor(measuredH / (dayEnd - dayStart)));

  // Camera ortho frustum: world is HOURS × HOUR_UNITS tall, plus a tiny
  // margin. Width comes from the canvas aspect ratio.
  const orthoHeight = HOURS * HOUR_UNITS;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {/* Empty hour-slot containers when nothing's selected — same as
          the CSS version so the calendar always reads as a 9–19 grid. */}
      {index === null && pxPerHour > 0 && (
        <div className="absolute inset-0">
          {Array.from({ length: dayEnd - dayStart }).map((_, i) => {
            const hour = dayStart + i;
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

      {/* Canvas mounts as soon as the body is measured — even in null
          state — so the WebGL context, env map, and shader compilation
          all complete BEFORE the user picks a status. First tile drop
          is then instant. */}
      {size.w > 0 && size.h > 0 && (
        <Canvas
          orthographic
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
            toneMapping: THREE.NoToneMapping,
            toneMappingExposure: 1.2,
          }}
          style={{ background: "transparent" }}
        >
          <CalendarScene
            index={index}
            schedules={schedules}
            pxPerHour={pxPerHour}
          />
        </Canvas>
      )}
    </div>
  );
}

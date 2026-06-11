"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text, RoundedBox } from "@react-three/drei";
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

// Stagger between consecutive tile drops, in seconds. Long enough
// that the previous tile lands before the next one spawns — serialized
// drop, not a parallel waterfall. Tuned alongside FALL_GRAVITY so the
// total Packed sequence (10 tiles) wraps in ~2s.
const SPAWN_STAGGER_S = 0.2;
const ENTRY_DELAY_S = 0.18;
// Initial drop offset (in world units, ABOVE the target slot).
const SPAWN_OFFSET_Y = 2.8;
// Gravity in world-units / s². Higher = quicker fall; tuned so a
// 2.8-unit drop lands in ~180ms.
const FALL_GRAVITY = 175;

// Convert a slot's hue (0-360) to an HSL THREE.Color tuned for the
// transmission material's color slot. Saturation/lightness matched to
// the previous CSS gradient stops.
function hueToColor(hue: number, lightness = 0.62): THREE.Color {
  return new THREE.Color().setHSL(hue / 360, 0.75, lightness);
}

interface TileProps {
  slot: Slot;
  slotIndex: number; // 0..schedule.length-1, used for stagger ordering
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
  worldWidth,
  restTopY,
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const tileHeight = (slot.end - slot.start) * HOUR_UNITS - TILE_GAP;
  const restCenterY = restTopY - tileHeight / 2;

  // Drop simulation state held in refs so we don't re-render every
  // frame — useFrame mutates the group transform directly.
  const phaseRef = useRef<"idle" | "falling" | "squash" | "rest">("idle");
  const timeRef = useRef(0);
  const yRef = useRef(restCenterY + SPAWN_OFFSET_Y);
  const vyRef = useRef(0);
  const scaleYRef = useRef(1);
  const scaleXRef = useRef(1);

  // Reset BEFORE first paint so the tile spawns at SPAWN_OFFSET_Y
  // above its rest position, not popping in at rest. useLayoutEffect
  // runs synchronously after DOM mutation, before the browser paints.
  useLayoutEffect(() => {
    phaseRef.current = "idle";
    timeRef.current = 0;
    yRef.current = restCenterY + SPAWN_OFFSET_Y;
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
  }, [restCenterY, slot.start, slot.end, slotIndex]);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    timeRef.current += dt;
    const startAt = ENTRY_DELAY_S + slotIndex * SPAWN_STAGGER_S;

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

  // Text size in world units. Hourly tiles are ~1 unit tall, so 0.32
  // is roughly 32% of tile height — readable. Full-day tiles get the
  // marquee treatment.
  const titleSize = useMemo(() => {
    if (isFullDay) return 0.7;
    return 0.32;
  }, [isFullDay]);

  const timeLabelSize = useMemo(() => 0.18, []);

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
          {/* MeshPhysicalMaterial with transmission composites with
              the page (canvas alpha) properly — no need for a refraction
              backbuffer, and it doesn't render black when there's no
              scene behind the tile. Iridescence + clearcoat give the
              squishy candy-glass look. */}
          <meshPhysicalMaterial
            color={tintColor}
            transparent
            opacity={0.78}
            transmission={0.55}
            thickness={1.4}
            ior={1.45}
            roughness={0.18}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.08}
            iridescence={0.35}
            iridescenceIOR={1.35}
            attenuationColor={tintColor}
            attenuationDistance={1.4}
            specularIntensity={0.85}
            sheen={0.6}
            sheenRoughness={0.4}
            sheenColor={tintColorBright}
            envMapIntensity={1.4}
          />
        </RoundedBox>

        {/* Inner highlight — slightly smaller box behind the front
            face that shows through the translucent material as a
            bright core, sells the "filled jelly" depth. */}
        <mesh position={[0, 0, -TILE_DEPTH * 0.15]}>
          <boxGeometry
            args={[
              worldWidth * 0.92,
              tileHeight * 0.85,
              TILE_DEPTH * 0.4,
            ]}
          />
          <meshBasicMaterial
            color={tintColorBright}
            transparent
            opacity={0.45}
          />
        </mesh>
      </group>

      {/* Time label — top-left, only on hourly tiles. Full-day blocks
          use the title as the marquee; the time label would be redundant. */}
      {!isFullDay && (
        <Text
          position={[
            -worldWidth / 2 + 0.18,
            0,
            TILE_DEPTH / 2 + 0.04,
          ]}
          fontSize={timeLabelSize}
          color="#FFFFFF"
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.022}
          outlineColor="#001050"
          outlineOpacity={0.9}
          outlineBlur={0.012}
        >
          {timeLabel}
        </Text>
      )}

      {/* Title — vertically centered. Hourly tiles get the title to
          the right of the time label; full-day blocks center across
          the whole tile. Heavy navy outline + outline blur so the
          glyphs read clearly against any tile color. */}
      <Text
        position={
          isFullDay
            ? [0, 0, TILE_DEPTH / 2 + 0.04]
            : [
                -worldWidth / 2 + 1.05,
                0,
                TILE_DEPTH / 2 + 0.04,
              ]
        }
        fontSize={titleSize}
        color="#FFFFFF"
        anchorX={isFullDay ? "center" : "left"}
        anchorY="middle"
        maxWidth={worldWidth * (isFullDay ? 0.92 : 0.78)}
        textAlign={isFullDay ? "center" : "left"}
        outlineWidth={isFullDay ? 0.05 : 0.03}
        outlineColor="#001050"
        outlineOpacity={0.92}
        outlineBlur={isFullDay ? 0.025 : 0.018}
      >
        {slot.title}
      </Text>
    </group>
  );
}

function CalendarScene({
  index,
  schedules,
  pxPerHour,
}: {
  index: AgendaIndex;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  pxPerHour: number;
}) {
  const { viewport } = useThree();
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (HOURS * HOUR_UNITS) / 2;

  const slots = schedules[index];

  return (
    <>
      {/* Environment map — clearcoat and iridescence need real
          reflections to shimmer. Drei ships a few preset HDRs;
          "studio" is a clean white-light setup that doesn't tint
          the tile colors. */}
      <Environment preset="studio" environmentIntensity={0.9} />
      {/* Direct lights stack on top of the env so each tile picks up
          a discrete glossy highlight, not just diffused env lighting. */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[1.5, 6, 4]}
        intensity={1.6}
        color="#ffffff"
      />
      <directionalLight
        position={[-3, 1, 3]}
        intensity={0.6}
        color="#fff1d6"
      />
      {slots.map((slot, i) => {
        const restTopY =
          worldYTop - (slot.start - 9) * HOUR_UNITS - TILE_GAP / 2;
        return (
          <GlassTile
            key={`${index}-${slot.start}-${slot.end}`}
            slot={slot}
            slotIndex={i}
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

      {index !== null && size.w > 0 && size.h > 0 && (
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

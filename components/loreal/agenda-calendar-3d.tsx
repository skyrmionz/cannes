"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
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

// Stagger between consecutive tile drops, in seconds. Roughly matches
// the previous Framer 80ms cadence.
const SPAWN_STAGGER_S = 0.08;
const ENTRY_DELAY_S = 0.25;
// Initial drop offset (in world units, ABOVE the target slot).
const SPAWN_OFFSET_Y = 4;

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
  pxPerHour,
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
      const gravity = 50;
      vyRef.current -= gravity * dt;
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
    } else if (phaseRef.current === "rest") {
      // Idle squish breathing — very subtle so the tiles feel alive.
      const t = timeRef.current;
      const offset = slotIndex * 0.4;
      scaleYRef.current = 1 + Math.sin((t + offset) * 1.6) * 0.012;
      scaleXRef.current = 1 - Math.sin((t + offset) * 1.6) * 0.012;
    }

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

  // Text size scales off the available calendar pixel resolution so
  // titles stay legible across kiosk vs phone widths.
  const titleSize = useMemo(() => {
    if (isFullDay) return Math.max(0.18, Math.min(pxPerHour / 280, 0.36));
    return Math.max(0.1, Math.min(pxPerHour / 700, 0.18));
  }, [isFullDay, pxPerHour]);

  const timeLabelSize = useMemo(
    () => Math.max(0.07, Math.min(pxPerHour / 1100, 0.11)),
    [pxPerHour],
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

      {/* Time label — top-left of tile, lifted off the front face
          so the transmission shader doesn't muddy it. */}
      <Text
        position={[
          -worldWidth / 2 + 0.14,
          tileHeight / 2 - 0.13,
          TILE_DEPTH / 2 + 0.04,
        ]}
        fontSize={timeLabelSize}
        color="#FFFFFF"
        anchorX="left"
        anchorY="top"
        outlineWidth={0.018}
        outlineColor="#001050"
        outlineOpacity={0.85}
        outlineBlur={0.01}
      >
        {timeLabel}
      </Text>

      {/* Title — left-aligned for hourly, centered for full-day.
          Thicker navy outline so it reads against any tile color. */}
      <Text
        position={
          isFullDay
            ? [0, 0, TILE_DEPTH / 2 + 0.04]
            : [
                -worldWidth / 2 + 0.7,
                tileHeight / 2 - 0.13,
                TILE_DEPTH / 2 + 0.04,
              ]
        }
        fontSize={titleSize}
        color="#FFFFFF"
        anchorX={isFullDay ? "center" : "left"}
        anchorY={isFullDay ? "middle" : "top"}
        maxWidth={worldWidth * (isFullDay ? 0.92 : 0.7)}
        textAlign={isFullDay ? "center" : "left"}
        outlineWidth={isFullDay ? 0.04 : 0.022}
        outlineColor="#001050"
        outlineOpacity={0.9}
        outlineBlur={isFullDay ? 0.02 : 0.012}
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
      {/* Bright top-key + soft warm fill + cool back-rim. The strong
          key on top is what gives every tile its glossy specular
          highlight; the warm fill keeps shadows from muddying. */}
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[1.5, 6, 4]}
        intensity={1.4}
        color="#ffffff"
      />
      <directionalLight
        position={[-3, 1, 3]}
        intensity={0.55}
        color="#fff1d6"
      />
      <directionalLight
        position={[0, -2, 5]}
        intensity={0.4}
        color="#cfe7ff"
      />
      {/* Hemispheric env helps the iridescence + clearcoat catch
          something to shimmer against (we don't load a big HDR; this
          fakes one for free). */}
      <hemisphereLight args={["#ffffff", "#a0c0ff", 0.6]} />
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

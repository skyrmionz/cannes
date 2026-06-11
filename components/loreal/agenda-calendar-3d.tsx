"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Text,
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
  worldYTop,
  restTopY,
  pxPerHour,
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tileHeight = (slot.end - slot.start) * HOUR_UNITS - TILE_GAP;
  const restCenterY = restTopY - tileHeight / 2;

  // Drop simulation state held in refs so we don't re-render every
  // frame — useFrame mutates the group transform directly.
  const phaseRef = useRef<"idle" | "falling" | "squash" | "rest">("idle");
  const timeRef = useRef(0);
  const yRef = useRef(restCenterY + SPAWN_OFFSET_Y);
  const vyRef = useRef(0);
  const scaleYRef = useRef(1);
  const opacityRef = useRef(0);

  // Reset on slot remount.
  useEffect(() => {
    phaseRef.current = "idle";
    timeRef.current = 0;
    yRef.current = restCenterY + SPAWN_OFFSET_Y;
    vyRef.current = 0;
    scaleYRef.current = 1;
    opacityRef.current = 0;
  }, [restCenterY]);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    timeRef.current += dt;
    const startAt = ENTRY_DELAY_S + slotIndex * SPAWN_STAGGER_S;

    if (phaseRef.current === "idle") {
      if (timeRef.current >= startAt) {
        phaseRef.current = "falling";
        vyRef.current = 0;
        opacityRef.current = 1;
      }
    } else if (phaseRef.current === "falling") {
      // Gravity (world units / s^2). Tuned so the drop lands in
      // ~400ms from a 4-unit initial offset.
      const gravity = 50;
      vyRef.current -= gravity * dt;
      yRef.current += vyRef.current * dt;
      if (yRef.current <= restCenterY) {
        yRef.current = restCenterY;
        phaseRef.current = "squash";
        timeRef.current = 0; // re-purpose timer for squash phase
        vyRef.current = 0;
      }
    } else if (phaseRef.current === "squash") {
      // 220ms vertical squash + bounce.
      const t = Math.min(1, timeRef.current / 0.22);
      // Squash: 1 → 0.92 → 1.04 → 1 via two ease curves.
      let s = 1;
      if (t < 0.4) {
        const k = t / 0.4;
        s = 1 - 0.08 * k;
      } else if (t < 0.7) {
        const k = (t - 0.4) / 0.3;
        s = 0.92 + 0.12 * k;
      } else {
        const k = (t - 0.7) / 0.3;
        s = 1.04 - 0.04 * k;
      }
      scaleYRef.current = s;
      if (t >= 1) {
        phaseRef.current = "rest";
        scaleYRef.current = 1;
      }
    }

    g.position.y = yRef.current;
    g.scale.y = scaleYRef.current;
  });

  const tintColor = useMemo(() => hueToColor(slot.hue, 0.6), [slot.hue]);
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
      <RoundedBox
        args={[worldWidth, tileHeight, TILE_DEPTH]}
        radius={TILE_RADIUS}
        smoothness={4}
      >
        <MeshTransmissionMaterial
          // Tint
          color={tintColor}
          // Real glass-ish parameters
          transmission={1}
          thickness={0.55}
          ior={1.45}
          roughness={0.05}
          chromaticAberration={0.04}
          anisotropy={0.18}
          distortion={0.05}
          distortionScale={0.4}
          temporalDistortion={0}
          // Background tint comes through. Lower samples to keep
          // perf reasonable on 10 simultaneous tiles.
          samples={4}
          resolution={256}
          backside={false}
          // Slight self-tint on the glass surface itself so the slot's
          // hue still reads even when the page bg behind is light.
          attenuationColor={tintColor}
          attenuationDistance={1.6}
        />
      </RoundedBox>

      {/* Time label — top-left of tile */}
      <Text
        position={[
          -worldWidth / 2 + 0.12,
          tileHeight / 2 - 0.13,
          TILE_DEPTH / 2 + 0.001,
        ]}
        fontSize={timeLabelSize}
        color="#FFFFFF"
        anchorX="left"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#001050"
        outlineOpacity={0.4}
      >
        {timeLabel}
      </Text>

      {/* Title — left-aligned for hourly, centered for full-day */}
      <Text
        position={
          isFullDay
            ? [0, 0, TILE_DEPTH / 2 + 0.001]
            : [
                -worldWidth / 2 + 0.6,
                tileHeight / 2 - 0.13,
                TILE_DEPTH / 2 + 0.001,
              ]
        }
        fontSize={titleSize}
        color="#FFFFFF"
        anchorX={isFullDay ? "center" : "left"}
        anchorY={isFullDay ? "middle" : "top"}
        maxWidth={worldWidth * (isFullDay ? 0.92 : 0.7)}
        textAlign={isFullDay ? "center" : "left"}
        outlineWidth={isFullDay ? 0.012 : 0.006}
        outlineColor="#001050"
        outlineOpacity={0.45}
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
  // Use viewport so the camera frames the exact bounds of the canvas.
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (HOURS * HOUR_UNITS) / 2;

  const slots = schedules[index];

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 5]} intensity={0.9} />
      <directionalLight position={[-3, 2, 3]} intensity={0.4} />
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

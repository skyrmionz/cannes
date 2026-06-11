"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  MeshTransmissionMaterial,
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

const HOURS = 10;
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

interface TileProps {
  slot: Slot;
  slotIndex: number;
  totalSlots: number;
  pxPerHour: number;
  worldWidth: number;
  worldYTop: number;
  restTopY: number;
  resetKey: string;
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
  const tileHeight = (slot.end - slot.start) * HOUR_UNITS - TILE_GAP;
  const restCenterY = restTopY - tileHeight / 2;
  const spawnY =
    worldYTop + SPAWN_OFFSCREEN_BUFFER + tileHeight / 2;

  const phaseRef = useRef<"idle" | "falling" | "squash" | "rest">("idle");
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

  useFrame((_, dt) => {
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
  });

  const tintColor = useMemo(() => hueToColor(slot.hue, 0.62), [slot.hue]);
  const isFullDay = slot.end - slot.start >= HOURS;

  // Text overlay sizing in CSS pixels.
  const textBoxWidthPx = Math.max(0, worldWidth * pxPerHour);
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
        {/* Real refractive glass via drei's MeshTransmissionMaterial.
            transmissionSampler:false uses the env map (Lightformers)
            as the transmission source — gives a clean tinted glass
            look without needing a backdrop plane to refract. This is
            the configuration used in drei's official examples. */}
        <MeshTransmissionMaterial
          color={tintColor}
          background={tintColor}
          transmission={1}
          thickness={1.4}
          ior={1.45}
          roughness={0.12}
          chromaticAberration={0.08}
          anisotropy={0.25}
          distortion={0.15}
          distortionScale={0.5}
          temporalDistortion={0.0}
          backside
          backsideThickness={0.6}
          attenuationColor={tintColor}
          attenuationDistance={1.4}
          samples={6}
          resolution={256}
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
}: {
  index: AgendaIndex | null;
  schedules: Record<AgendaIndex, ReadonlyArray<Slot>>;
  pxPerHour: number;
}) {
  const { viewport } = useThree();
  const worldWidth = viewport.width * 0.96;
  const worldYTop = (HOURS * HOUR_UNITS) / 2;

  const slots = index === null ? [] : schedules[index];
  const totalSlots = slots.length;

  return (
    <>
      {/* Environment with custom Lightformers for crisp specular
          highlights on each tile. No external HDR fetch. */}
      <Environment background={false} resolution={256}>
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
          intensity={1.5}
          color="#fff7e0"
          position={[-6, 2, 3]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#dceeff"
          position={[6, 2, 3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[6, 6, 1]}
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

  // Camera frames HOURS + 2*WORLD_MARGIN so full-day tiles never
  // touch the visible top/bottom edges. Computed zoom keeps the
  // pxPerHour used for tile/text math correct.
  const orthoHeight = HOURS * HOUR_UNITS + WORLD_MARGIN * 2;

  return (
    // overflow: visible so the canvas (which extends past the body for
    // off-screen tile spawns) doesn't get clipped at the rounded card edge.
    <div ref={ref} className="relative h-full w-full">
      {/* Empty hour-slot containers when nothing's selected. */}
      {index === null && pxPerHour > 0 && (
        <div className="absolute inset-0 overflow-hidden">
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
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
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

# Visualizer Spec — F1 TrackStar Cannes 2026

## Goal
Replace the current radial-bar `SongVisualizer` with a p5.js cartoon landscape
animation that exports as a 30-second MP4 (3 × 10s loops). The video is the
shareable social artifact guests take away from the kiosk.

## Visual reference
Flat low-poly cartoon landscape. Think:
- Layered parallax scene: sky → mountains → floating islands → water → foreground
- Bright saturated colours: warm sunset sky, bold greens, blue water, coloured trees
- Shapes are flat-shaded polygons (no gradients within shapes, just solid fills)
- Friendly and fun — this is a party activation, not a data viz

Key elements (all animated, all audio-reactive):
1. **Sky** — gradient from warm top to cool horizon; hue shifts slowly with energy
2. **Sun / moon** — large circle, top-right; pulses scale on kick/bass hit
3. **Mountains** — 3–5 layered silhouettes behind the islands; heights pulse on bass
4. **Floating islands** — 2–3 flat oval platforms; bob up/down gently; bounce on beat
5. **Trees** — cone (pine) and circle (leafy) shapes on islands; sway side-to-side with mids
6. **Water** — animated sine wave fills the lower third; speed increases with energy
7. **Driver name** — bottom centre, bold uppercase Avant Garde font, white with drop shadow

## Audio reactivity
All reactivity is driven by the offline `AnalyserNode` frequency snapshot already
passed to `drawFrame(t, freqData)` — no live audio needed during export.

| Frequency band | Maps to |
|---|---|
| Bass (bins 0–4) | Mountain height, island bounce, sun pulse |
| Mids (bins 5–20) | Tree sway amplitude, water wave height |
| Highs (bins 21–64) | Water speed, sky shimmer, leaf count |
| Overall energy (rms) | Global brightness / saturation boost |

## Color palette — seeded by teamId
Each team gets a distinct sky + accent palette. The landscape greens and water
blues stay consistent; only sky/sun/mountain hue changes per team.

| teamId | Sky top | Sky horizon | Accent |
|---|---|---|---|
| red-bull | #1a0a2e | #E10600 | #3333ff |
| ferrari | #ff4500 | #ff8c00 | #E10600 |
| mclaren | #ff6b00 | #ffb347 | #0a3d62 |
| mercedes | #0d2137 | #1a6b5c | #00d2b4 |
| haas / others | #2d1b69 | #e94560 | #f5a623 |

## Canvas size
**540 × 960 px** (9:16 portrait — optimised for Instagram Stories / TikTok)

Previous implementation used 540×540. Change to 540×960. The `useVideoExport`
hook must be updated to match.

## Output
- **Duration**: 30 seconds (3 × 10s perfect loop — the scene resets at t=10 and t=20)
- **Format**: H.264/AAC MP4 via WebCodecs + mp4-muxer (existing pipeline, unchanged)
- **Frame rate**: 30 fps
- **File name on download**: `{driver-name-slug}-anthem.mp4`

## Implementation

### File to replace
`cannes-main/components/f1/song-visualizer.tsx`

Keep the same exported interface:
```typescript
export interface VisualizerHandle {
  drawFrame(t: number, freqData: Uint8Array): void;
  canvas: HTMLCanvasElement | null;
}
export const SongVisualizer = forwardRef<VisualizerHandle, SongVisualizerProps>(...)
```

Props (unchanged):
```typescript
interface SongVisualizerProps {
  teamId: string;
  driverName: string;
  analyser?: AnalyserNode | null;
  width?: number;     // default 540
  height?: number;    // default 960
  className?: string;
}
```

### Use real p5.js
Install p5 and its types:
```
npm install p5
npm install --save-dev @types/p5
```

Use p5 in **instance mode** (not global) so it doesn't pollute `window`.
The p5 sketch should:
- Accept `freqData: Uint8Array` via a ref that `drawFrame` updates before each frame
- Use `p.draw()` for the live animation loop
- Support an `offlineMode` flag that disables `p.loop()` so frames are drawn
  only when `drawFrame()` is called explicitly (needed for export)

### Parallax layers — draw order (back to front)
1. Sky fill (rect covering full canvas)
2. Sun / moon (ellipse, top-right quadrant)
3. Mountains — 3 layers, each a closed polygon, slightly different hue/lightness
4. Water — lower 30% of canvas, sine wave top edge, solid fill below
5. Islands — 2 oval platforms, centre and left-of-centre
6. Trees on islands — mix of cones and circles
7. Foreground grass strip (bottom edge, partial)
8. Driver name text

### Animation — 10s loop
All animations should use `t % 10` so they loop perfectly.

| Element | Animation |
|---|---|
| Islands | `y += sin(t * TWO_PI / 10) * 8` — gentle bob |
| Mountains | Height multiplied by `1 + bassNorm * 0.15` |
| Sun | `r *= 1 + bassNorm * 0.08` on each beat |
| Trees | `rotate(sin(t * TWO_PI / 3) * midNorm * 0.08)` |
| Water wave | `sin(x * freq + t * speed)` where speed scales with energy |
| Sky hue | `hue += highsNorm * 5` per frame, resets each loop |

## Acceptance criteria
A PR or commit passes when ALL of the following are true:

- [ ] `npm run build` exits 0 with no TypeScript errors
- [ ] The visualizer renders a recognisable flat cartoon landscape (sky, mountains,
      islands, trees, water visible)
- [ ] Color palette visibly changes between teamId values
- [ ] Elements visibly react to `freqData` (not static when audio data varies)
- [ ] The 10-second loop is seamless — no jump at t=0/10/20
- [ ] Canvas aspect ratio is 9:16 (540×960)
- [ ] `drawFrame(t, freqData)` works in offline mode (used by `useVideoExport`)
- [ ] The live animation runs in the result screen alongside the 3D scene
- [ ] The existing `useVideoExport` hook produces a valid MP4 with the new canvas size
- [ ] Driver name is legible at the bottom of the canvas
- [ ] No console errors during live playback or export

## What NOT to change
- `hooks/use-video-export.ts` — only update WIDTH/HEIGHT constants to 540/960
- `app/api/share/[code]/video/route.ts` — unchanged
- `lib/f1-share.ts` — unchanged
- `components/f1/result-screen.tsx` — only update the canvas size props passed to SongVisualizer
- The existing keyboard controller mapping
- The existing session tracking

## Notes for the implementing agent
- p5 instance mode: `new p5((p) => { p.setup = ...; p.draw = ...; }, canvasParent)`
- For offline/export mode, call `p.noLoop()` after setup and drive frames manually
- `freqData` is a `Uint8Array` of length 128 (fftSize=256, binCount=128)
- Bass norm: `freqData.slice(0,4)` average / 255
- Mid norm: `freqData.slice(5,20)` average / 255
- High norm: `freqData.slice(21,64)` average / 255
- The canvas element is accessed via `p.canvas` after setup
- All shape coordinates should be expressed as fractions of W/H so the sketch
  is resolution-independent

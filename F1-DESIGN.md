# F1 Experience — Design Guide

## Brand Identity

The F1 experience emulates the look and feel of the official Formula 1 brand and the EA Sports F1 game UI. It's dark, dramatic, high-contrast, and feels like stepping into a racing video game.

---

## Color Palette

| Token             | Value                              | Usage                                      |
|-------------------|------------------------------------|---------------------------------------------|
| Background        | `#0a0a0a`                          | Page background, near-black                 |
| Surface           | `#1a1a1a`                          | Cards, inputs, panels                       |
| Surface Hover     | `#222222`                          | Hovered cards/buttons                       |
| F1 Red            | `#E10600`                          | Primary accent, CTAs, selected borders, loading bar |
| Text Primary      | `#ffffff`                          | Headlines, labels, key content              |
| Text Secondary    | `#b0b0b0`                          | Descriptions, subtitles                     |
| Text Muted        | `#6b7280` (neutral-500)            | Metadata, placeholders                      |
| Border Default    | `#262626` (neutral-800)            | Card/input borders, dividers                |
| Border Hover      | `#525252` (neutral-600)            | Hovered card borders                        |
| Border Selected   | `#E10600`                          | Selected card accent                        |
| Glow Selected     | `rgba(225, 6, 0, 0.25)`           | Box-shadow on selected cards                |

## Typography

- **Font Family:** Avant Garde For Salesforce (already loaded as `--font-avant-garde`)
- **Headers:** Bold/Semibold, UPPERCASE, letter-spacing `0.15em–0.3em`
- **Body/Descriptions:** Regular weight, mixed case or uppercase, `tracking-wider`
- **All text is white or light gray** — never dark text on dark bg

| Element            | Size                | Weight   | Transform  | Tracking         |
|--------------------|---------------------|----------|------------|------------------|
| Screen Title       | `text-2xl md:text-3xl` | Semibold | Uppercase  | `tracking-[0.2em]` |
| Subtitle / Above   | `text-sm`           | Normal   | Uppercase  | `tracking-[0.3em]` |
| Large Hero Text    | `text-4xl md:text-5xl` | Semibold | None       | `tracking-tight` |
| Card Label         | `text-base md:text-lg` | Semibold | Uppercase  | `tracking-wider` |
| Card Description   | `text-sm`           | Normal   | None       | Normal           |
| Button Text        | `text-sm`           | Semibold | Uppercase  | `tracking-[0.2em]` |
| TAP TO START       | `text-lg`           | Normal   | Uppercase  | `tracking-[0.3em]` |

## Layout Principles

- **Full viewport height** — each screen fills `min-h-screen`
- **Content centered** — flex column, items-center, justify-center
- **Max content width:** `max-w-lg` for text content, `max-w-2xl` for card grids
- **Spacing:** 8px base unit. Gaps between elements: 16px–32px. Section gaps: 40px–64px.
- **Logo header** sits at the top of screens (absolute or in-flow, `pt-12`)

## Components

### Selection Cards (Question Screens)
- 2x2 grid on desktop (`grid-cols-2 gap-4`), single column on mobile
- Card: `bg-[#1a1a1a] border border-neutral-800 rounded-sm p-5`
- Hover: `border-neutral-600 scale-[1.02]` with transition
- Selected: `border-[#E10600] shadow-[0_0_20px_rgba(225,6,0,0.25)]`
- Rounded corners: `rounded-sm` (2-4px) — angular, not soft. Racing feel.
- Card content: Label (bold, uppercase, white) + Description (smaller, gray)
- Auto-advance 400ms after selection

### Buttons
- **Primary (CTA):** `bg-[#E10600] text-white uppercase tracking-[0.2em] px-10 py-3 rounded-sm`
  - Hover: `bg-[#c00500]`
  - Disabled: `opacity-40 cursor-not-allowed`
- **Outline/Ghost:** `border border-neutral-700 text-neutral-300 px-6 py-2 rounded-sm`
  - Hover: `border-[#E10600] text-white`

### Text Input (Name Entry)
- `bg-[#1a1a1a] border border-neutral-700 text-white text-center text-lg`
- Focus: `border-[#E10600] ring-2 ring-[#E10600]/30`
- Placeholder: gray, italic or normal
- Width: `w-full max-w-sm`

### Logo Header
- F1 logo (white) `|` Salesforce logo (white)
- Both ~40px height, separated by a thin white vertical divider (1px, 0.4 opacity)
- Centered horizontally
- CSS filter `brightness-0 invert` makes colored logos white

## Animations & Transitions

### Step Transitions (Forward/Backward)
```
Enter (forward):  { y: 60, opacity: 0 }  →  { y: 0, opacity: 1 }
Exit (forward):   { y: 0, opacity: 1 }   →  { y: -60, opacity: 0 }
Enter (backward): { y: -60, opacity: 0 }  →  { y: 0, opacity: 1 }
Exit (backward):  { y: 0, opacity: 1 }   →  { y: 60, opacity: 0 }
Duration: 0.45s, ease: [0.32, 0.72, 0, 1]
```

### Start Screen Fade-Out
```
Exit: { opacity: 0, scale: 1.05 }
Duration: 0.6s, ease: easeInOut
```

### TAP TO START Pulse
```
Opacity: [0.4, 1, 0.4] looping
Duration: 1.5s, ease: easeInOut, repeat: Infinity
```

### Card Entrance (Staggered)
Each card fades in with a 50ms stagger delay.

### Loading Bar
Red bar fills from 0% to 100% width over 3 seconds.

## Visual Accents

### Speed Lines (Decorative)
- 3–5 diagonal lines at ~15° across the viewport
- `bg-[#E10600]` at 3–5% opacity
- `pointer-events-none`, absolute positioned
- Present on all screens except the Start Screen

## Screen Flow

```
[0] Start Screen     → tap anywhere
[1] Intro            → "Next" button
[2] Name Entry       → "Next" button (when name entered)
[3] Driving Style    → auto-advance on selection
[4] Driver Choice    → auto-advance on selection
[5] Circuit Choice   → auto-advance on selection
[6] Loading          → auto-advance after 3s
[7] Result           → "Start Over" returns to entry page (/)
```

Back navigation available on screens 2–5 (not on Start, Loading, or Result).

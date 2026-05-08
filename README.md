# F1 TrackStar — Cannes Lions 2026 (Next.js app)

Cinematic kiosk experience for Salesforce Beach at Cannes Lions (June 22–25, 2026). Guests make three choices and receive a personalised pre-rendered song with live AI race commentary.

---

## How it works

1. Guest enters their **name**
2. Guest picks a **circuit** (5 options — controls the drum stem)
3. Guest picks their **celebration style** (5 options — controls the bass stem)
4. Guest picks their **favourite team** (11 teams grouped into 5 melody stems)
5. App resolves the combination → fetches one of **125 pre-rendered songs** from `/public/songs/`
6. Cinematic Three.js podium scene plays — a randomly assigned pixel character pops up
7. **AI race commentary** fires at 12 seconds: OpenRouter (Claude) writes a personalised script, ElevenLabs renders the TTS, plays over the song loop

---

## Stem / song naming convention

Songs live in `public/songs/` (gitignored — copied in at deploy time):

```
{circuit}-{celebration}-{melodyGroup}.wav

Examples:
  monaco-jump-ferrari.wav
  silverstone-meltdown-red-bull.wav
  monza-tears-haas.wav
```

**Circuit IDs:** `monaco` `silverstone` `spa` `suzuka` `monza`

**Celebration IDs:** `jump` `nod` `meltdown` `frozen` `tears`

**Melody group IDs** (teams are collapsed into 5 groups):

| Group ID   | Teams |
|---|---|
| `red-bull` | Red Bull, Racing Bulls |
| `ferrari`  | Ferrari |
| `mclaren`  | McLaren, Williams |
| `mercedes` | Mercedes, Audi |
| `haas`     | Haas, Aston Martin, Alpine, Cadillac |

---

## Generating placeholder songs

Run this once to fill `public/songs/` with TTS placeholders for testing while the musician works:

```bash
export $(cat ../.env | xargs) && node ../scripts/generate-placeholder-songs.mjs
```

---

## Setup

```bash
npm install
cp env.example .env.local
# fill in keys
npm run dev
# http://localhost:3000/f1
```

Copy placeholder WAVs into `public/songs/` before running.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Claude via OpenRouter (commentary script) |
| `OPENROUTER_MODEL` | Defaults to `anthropic/claude-sonnet-4.6` |
| `ELEVENLABS_API_KEY` | TTS for commentary audio |
| `ELEVENLABS_VOICE_ID` | Optional — defaults to Rachel if not set |
| `DATABASE_URL` | Postgres for share links |

---

## Architecture

```
Browser (kiosk — Next.js /f1)
├── Rotary knob UI — circuit → celebration → team (3 questions)
├── 3.5s theatrical loading screen
├── Three.js podium scene — random pixel character, car drive-by, confetti
├── Web Audio — loops pre-rendered WAV from /public/songs/
└── Commentary fires at 12s: API → OpenRouter → ElevenLabs → plays over loop

API routes
├── POST /api/generate-song  → resolves combo → returns /songs/{filename}.wav
├── POST /api/commentary     → writes script + renders TTS, returns audio/mpeg
└── POST /api/share          → stores share metadata in Postgres
```

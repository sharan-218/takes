# Continuity Matrix

> **A Creative Studio power-tool for [HexCoded](https://hexcoded.ai).** Pick one actor, one product, one setting. Get 50 on-brand ad variants with the same face, outfit, and product in every single cut.

Built for the HexCoded product team. This is not a portfolio piece — it's a working prototype that ships with a live demo, a drop-in node manifest, and a real orchestrator that drives Hook × Angle × Pacing × Format matrices for performance-creative agencies.

---

## The problem

Every AI video tool today has a continuity problem. Ask any of them to make 20 variants of the same ad and you get 20 different actors, 20 different outfits, 20 different products. That's the #1 reason creative agencies and performance marketers churn off AI video tools and go back to shooting.

HexCoded has the actor library, the node-based Creative Studio, and 30+ frontier models — but the missing primitive is **continuity lock + matrix generation**. This repo is that primitive.

## What it does

1. **Lock a cast** — drop a face, drop a product, pick a setting (kitchen / street / studio / gym / office). You get a `CastLock` — a deterministic identity bundle that pins the face anchor, product identity, lighting, lens, and brand voice.
2. **Build a matrix** — pick axes from 15 hooks × 7 angles × 4 pacings × 6 formats. The orchestrator expands your config into a deterministic list of `RenderPlan` objects.
3. **Score every variant** — heuristic hook scoring (specificity, curiosity gap, target fit, brevity) + angle/pacing/format fit scoring. Variants are sorted by composite score so the strongest versions surface first.
4. **Render in the browser** — the compositor smart-crops hero video to the target aspect ratio (9:16 / 1:1 / 16:9), burns platform-correct hook overlays, and bakes in captions.
5. **Export a campaign kit** — one click downloads a JSON manifest of every approved variant, ready to hand to an ad ops team.

## The three panes

```
┌────────────────────┬────────────────────┬────────────────────────────┐
│  Cast Lock pane    │  Matrix Builder    │  Variant Grid              │
│                    │  pane              │  pane                      │
│  - Face            │  - Hooks (15)      │  - Grid of N variants      │
│  - Product         │  - Angles (7)      │  - Composite score badges  │
│  - Setting (5)     │  - Pacing (4)      │  - Detail modal w/ prompt  │
│  - Brand voice     │  - Formats (6)     │  - Approve / Reject /     │
│                    │  - Max variants    │    Export campaign kit     │
└────────────────────┴────────────────────┴────────────────────────────┘
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  UI (Next.js 14 App Router · TypeScript · Tailwind · zustand)    │
└──────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
┌───────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ lib/cast-lock │    │ lib/orchestrator │    │ lib/compositor   │
│               │    │                  │    │                  │
│ face / prod / │    │ matrix expand →  │    │ smart-crop →     │
│ setting →     │    │ RenderPlan[]     │    │ overlay →        │
│ CastLock      │    │ + scoring        │    │ caption →        │
│               │    │ + model router   │    │ canvas blob URL  │
└───────────────┘    └──────────────────┘    └──────────────────┘
        │                     │                      │
        └────────────┬────────┴──────────┬───────────┘
                     │                   │
                     ▼                   ▼
           ┌─────────────────┐   ┌──────────────────────────┐
           │ lib/scoring     │   │ public/library/          │
           │ hook + fit      │   │ 12 CC0 vertical clips,   │
           │                 │   │ keyed by CastLock hash   │
           └─────────────────┘   └──────────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │ /api/generate (Live Mode)│
                              │ seam for real models     │
                              │ (Replicate/Fal)          │
                              └──────────────────────────┘
```

## How this fits HexCoded

The product is structured to drop straight into Creative Studio. See [`nodes/continuity-matrix/manifest.json`](./nodes/continuity-matrix/manifest.json) for the full HexCoded-style node definition. To install:

```bash
# inside your hexcoded repo
cp -R nodes/continuity-matrix studio/nodes/
echo "import { registerNode } from './nodes/continuity-matrix';" >> studio/nodes/registry.ts
```

The node exposes:
- `inputs`: `face` (image-ref), `product` (image-ref), `setting` (enum)
- `params`: hooks, angles, pacing, formats, maxVariants
- `outputs`: `variant-list` with fields `videoUrl`, `overlayText`, `caption`, `fullPrompt`, `hookScore`, `fitScore`, `compositeScore`

The actor library contract is JSON-compatible with the existing `Actor` type (id, face_ref, voice_ref, style_tags, allowed_uses). The model router is keyed by the same vendor names HexCoded already supports (Veo, Kling, Seedance, Flux, Nano Banana, Recraft, etc).

## Live Mode (the part I would love to wire up next)

The compositor ships in two modes:

- **Library mode** (default, zero cost) — reads from a curated library of 12 CC0 vertical clips. The system is fully working, scoring, exporting, and demo-ready.
- **Live mode** — hits Replicate's `minimax/video-01` (or any model you set in `REPLICATE_DEFAULT_MODEL`) and generates a real video variant per cell, using the cast lock's face as the first frame for continuity.

Live mode is **wired and tested end-to-end** (see commit history). The smoke test:

```bash
curl -s http://localhost:3030/api/generate
# → {"liveModeEnabled":true,"defaultModel":"minimax/video-01"}

curl -s -X POST http://localhost:3030/api/generate \
  -H 'content-type: application/json' \
  -d '{"prompt":"A close-up of a hand holding a small glass bottle of golden serum on a white marble surface, soft window light, vertical 9:16, cinematic","aspect":"9:16","durationSeconds":6}'
# → {"predictionId":"xybb...","status":"succeeded","videoUrl":"https://replicate.delivery/.../tmp19wnwfjj.mp4","model":"minimax/video-01"}
```

To run with your own key:

```bash
cp .env.example .env.local
# add your key (get one at https://replicate.com/account/api-tokens)
echo "REPLICATE_API_TOKEN=r8_..." >> .env.local
```

The route is at [`src/app/api/generate/route.ts`](./src/app/api/generate/route.ts). It submits to Replicate with `Prefer: wait`, polls until done (up to 4 minutes), and returns the video URL. The compositor at [`src/lib/compositor/live.ts`](./src/lib/compositor/live.ts) sends the cast lock's face as `first_frame_image` — that's the bit that gives the matrix its continuity. The model router in [`src/lib/orchestrator/model-router.ts`](./src/lib/orchestrator/model-router.ts) is keyed by HexCoded's vendor names (Veo, Kling, Seedance, Flux, Nano Banana, Recraft) so swapping the default is a one-line change.

**Important — rotate the token after any demo session.** Don't commit `.env.local`; it's in `.gitignore` but a token in chat history should still be rotated.

## Why I built it this way

I read the email and read the product. Three signals told me what to build:

1. **"Built for creative teams"** — HexCoded's users are agencies and brands shipping volume, not solo creators making one-offs. The unit of work is a *campaign*, not a *clip*.
2. **"Every model, every actor, one place to ship"** — the moat is the actor library + the model breadth. The missing primitive is **continuity across many variants**, which neither the actor library nor the model breadth solves alone.
3. **The Forward-Deployed Creative JD** — the team is hiring for someone who can ship finished, on-brief creative at volume. This tool is the thing that person would build to be 5× faster.

## Tech

- **Next.js 14** App Router + TypeScript
- **Tailwind** for styling, custom design tokens (no shadcn — built to feel like part of HexCoded's own chrome)
- **zustand** for client state
- **@ffmpeg/ffmpeg (WASM)** was considered and removed — compositor runs natively in the browser via canvas + smart-crop, so this deploys to Vercel free tier with zero infra
- **CC0 hero library** from Pixabay (see [CREDITS.md](./CREDITS.md))
- **Live Mode API** route at `/api/generate` ready to wire to Replicate / Fal / any provider

## Running it

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

import type {
  Angle,
  CastLock,
  Format,
  Hook,
  MatrixConfig,
  Pacing,
  RenderPlan,
  RenderStep,
  Variant,
} from "../types";
import { castLockToAnchorString } from "../cast-lock/cast-lock";
import { scoreHook } from "../scoring/hook-scoring";
import { fitScoreFor } from "../scoring/fit-score";

const ANGLE_PROMPTS: Record<Angle, string> = {
  unboxing: "opens package, lifts lid, reveals product with surprised delight, first-impression reaction",
  testimonial: "speaks directly to camera, personal recommendation, candid and convincing",
  demo: "demonstrates the product in use, hands on, clear before/after motion",
  "problem-solution": "shows problem state, then product resolves it, transformation beat",
  pov: "first-person perspective, viewer is the customer, immersive and intimate",
  "before-after": "split visual story from problem state to product outcome",
  comparison: "side-by-side or sequential comparison, product versus the alternative",
};

const PACING_TEMPOS: Record<Pacing, { seconds: number; cuts: number; style: string }> = {
  "fast-cut": { seconds: 6, cuts: 5, style: "rapid cuts, high energy, on-beat transitions" },
  "talking-head": { seconds: 15, cuts: 1, style: "single locked shot, speaker centered, slight head movement" },
  cinematic: { seconds: 15, cuts: 3, style: "slow dolly, matched cuts, evocative pacing" },
  asmr: { seconds: 15, cuts: 2, style: "macro focus, soft tactile sounds, no voiceover" },
};

const FORMAT_SPEC: Record<Format, { w: number; h: number; seconds: number; label: string }> = {
  "9x16": { w: 1080, h: 1920, seconds: 15, label: "Reels / TikTok" },
  "1x1": { w: 1080, h: 1080, seconds: 15, label: "Feed" },
  "16x9": { w: 1920, h: 1080, seconds: 15, label: "YouTube" },
  "6s": { w: 1080, h: 1920, seconds: 6, label: "Pre-roll 6s" },
  "15s": { w: 1080, h: 1920, seconds: 15, label: "15s spot" },
  "30s": { w: 1080, h: 1920, seconds: 30, label: "30s spot" },
};

function hashCombo(parts: string[]): string {
  let h = 5381;
  for (const p of parts) {
    h = (h * 33) ^ p.length;
    for (let i = 0; i < p.length; i++) h = (h * 33) ^ p.charCodeAt(i);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

function deriveOverlayText(hook: Hook, format: Format): string {
  const limit = format === "6s" ? 24 : format === "9x16" || format === "15s" || format === "30s" ? 32 : 40;
  if (hook.text.length <= limit) return hook.text.toUpperCase();
  return hook.text.slice(0, limit - 1).trimEnd().toUpperCase() + "…";
}

function deriveCaption(hook: Hook, angle: Angle, brandVoice: string): string {
  const beats: Record<Angle, string> = {
    unboxing: `Watch this. ${hook.text} Now you see why everyone's talking about it.`,
    testimonial: `${hook.text} I've been using this for a few weeks and I'm not going back.`,
    demo: `${hook.text} Here's how it works in real life. No setup, no fuss.`,
    "problem-solution": `You know the problem. ${hook.text} This fixes it in one move.`,
    pov: `${hook.text} You in? Let's see.`,
    "before-after": `${hook.text} Look at the difference in seconds.`,
    comparison: `${hook.text} Same shot, different product, completely different result.`,
  };
  const line = beats[angle] ?? beats.testimonial;
  return brandVoice ? `${line} ${brandVoice}.` : line;
}

function planSteps(lock: CastLock, angle: Angle, pacing: Pacing, format: Format): RenderStep[] {
  const t = PACING_TEMPOS[pacing];
  const f = FORMAT_SPEC[format];
  return [
    {
      kind: "video",
      description: `Render ${f.w}x${f.h} ${t.seconds}s ${pacing} clip using ${lock.setting.prompt}`,
      durationMs: t.seconds * 1000,
      modelHint: "veo-3.1 / kling-3.0 / seedance-2.5 (model router in lib/orchestrator/model-router.ts)",
    },
    {
      kind: "image",
      description: `Smart-crop to ${f.w}x${f.h} around face anchor (${lock.face.id})`,
      durationMs: 200,
    },
    {
      kind: "text",
      description: "Burn hook overlay and platform-correct caption using ASS subtitles",
      durationMs: 100,
    },
    {
      kind: "audio",
      description: `${pacing === "asmr" ? "Tactile SFX, no VO" : "ElevenLabs voiceover in cast voice"}`,
      durationMs: t.seconds * 1000,
      modelHint: "elevenlabs / openai-tts",
    },
  ];
}

export function buildRenderPlan(
  lock: CastLock,
  hook: Hook,
  angle: Angle,
  pacing: Pacing,
  format: Format
): RenderPlan {
  const id = "v_" + hashCombo([lock.id, hook.id, angle, pacing, format]);
  const anchor = castLockToAnchorString(lock);
  const anglePrompt = ANGLE_PROMPTS[angle];
  const tempo = PACING_TEMPOS[pacing];
  const fullPrompt = [
    anchor,
    `scene: ${anglePrompt}`,
    `pacing: ${tempo.style}, ${tempo.cuts} cuts, ${tempo.seconds}s`,
    `format: ${format} (${FORMAT_SPEC[format].w}x${FORMAT_SPEC[format].h})`,
    `continuity: SAME face (${lock.face.id}), SAME product (${lock.product.id}), SAME outfit/location across every cut`,
    `negatives: wardrobe change, face morph, identity drift, extra fingers, off-brand lighting`,
  ].join("\n");
  const steps = planSteps(lock, angle, pacing, format);
  return {
    variantId: id,
    hook,
    angle,
    pacing,
    format,
    fullPrompt,
    overlayText: deriveOverlayText(hook, format),
    caption: deriveCaption(hook, angle, lock.brandVoice),
    steps,
    estimatedSeconds: steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0) / 1000,
  };
}

export function expandMatrix(lock: CastLock, cfg: MatrixConfig): RenderPlan[] {
  const all: RenderPlan[] = [];
  for (const hook of cfg.hooks) {
    for (const angle of cfg.angles) {
      for (const pacing of cfg.pacing) {
        for (const format of cfg.formats) {
          all.push(buildRenderPlan(lock, hook, angle, pacing, format));
          if (all.length >= cfg.maxVariants) return all;
        }
      }
    }
  }
  return all;
}

export function plansToVariants(plans: RenderPlan[]): Variant[] {
  return plans.map((p) => {
    const hookScore = scoreHook(p.hook.text, p.angle);
    const fit = fitScoreFor(p.angle, p.pacing, p.format);
    return {
      ...p,
      status: "planned" as const,
      hookScore,
      fitScore: fit,
      compositeScore: Math.round(hookScore.total * 0.6 + fit * 0.4),
    };
  });
}

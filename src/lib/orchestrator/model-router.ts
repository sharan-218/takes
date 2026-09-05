export const MODEL_REGISTRY = {
  video: {
    "veo-3.1": { vendor: "Google", tier: "frontier", strengths: ["cinematic", "long-take"] },
    "kling-3.0": { vendor: "Kling", tier: "frontier", strengths: ["motion", "face-consistency"] },
    "seedance-2.5": { vendor: "BytePlus", tier: "frontier", strengths: ["speed", "lip-sync"] },
    "minimax-h3": { vendor: "MiniMax", tier: "frontier", strengths: ["avatar motion"] },
  },
  image: {
    "flux-2-max": { vendor: "Black Forest", tier: "frontier", strengths: ["type", "photoreal"] },
    "nano-banana-pro": { vendor: "Google", tier: "frontier", strengths: ["consistency", "edit"] },
    "gpt-image-2": { vendor: "OpenAI", tier: "frontier", strengths: ["instruction-following"] },
    "recraft-4.1": { vendor: "Recraft", tier: "frontier", strengths: ["brand", "vector"] },
  },
  audio: {
    elevenlabs: { vendor: "ElevenLabs", tier: "standard", strengths: ["voice-clone"] },
  },
} as const;

export type ModelKey = keyof typeof MODEL_REGISTRY.video | keyof typeof MODEL_REGISTRY.image;

export function pickModelFor(intent: "cinematic" | "face-consistency" | "speed" | "type"): string {
  if (intent === "cinematic") return "veo-3.1";
  if (intent === "face-consistency") return "kling-3.0";
  if (intent === "speed") return "seedance-2.5";
  return "veo-3.1";
}

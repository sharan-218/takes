import type { Variant, CastLock } from "../types";

export interface LiveResult {
  videoUrl: string;
  predictionId: string;
  model: string;
}

function buildLivePrompt(variant: Variant, castLock: CastLock): string {
  const angle = variant.angle;
  const pacing = variant.pacing;
  const aspect =
    variant.format === "1x1" ? "1:1" : variant.format === "16x9" ? "16:9" : "9:16";
  const lines: string[] = [
    `[${aspect} vertical, ${pacing} pacing]`,
    `Actor: ${castLock.face.identityPrompt} (${castLock.face.expression}, ${castLock.face.skinTone} skin tone).`,
    `Product: ${castLock.product.name} (${castLock.product.category}, ${castLock.product.scaleRef}).`,
    `Setting: ${castLock.setting.prompt}.`,
    `Lighting: ${castLock.setting.lighting}.`,
    `Lens: ${castLock.setting.lens}.`,
    `Mood: ${castLock.setting.mood}.`,
    `Brand voice: ${castLock.brandVoice}.`,
    `Scene: ${angle} — hook overlay "${variant.hook.text}".`,
    `Continuity: same face, same product, same outfit, same setting across all cuts.`,
  ];
  return lines.join(" ");
}

export async function generateLive(
  variant: Variant,
  castLock: CastLock
): Promise<LiveResult> {
  const firstFrame = castLock.face.faceRef?.trim();
  const body: Record<string, unknown> = {
    prompt: buildLivePrompt(variant, castLock),
    castLockId: castLock.id,
    aspect: variant.format === "1x1" ? "1:1" : variant.format === "16x9" ? "16:9" : "9:16",
    durationSeconds: 6,
  };
  if (firstFrame && firstFrame.startsWith("data:image")) {
    body.firstFrameImage = firstFrame;
  }
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      detail = await res.text();
    }
    throw new Error(`live generation failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as {
    videoUrl?: string;
    predictionId?: string;
    model?: string;
  };
  if (!data.videoUrl) {
    throw new Error("live generation returned no videoUrl");
  }
  return {
    videoUrl: data.videoUrl,
    predictionId: data.predictionId ?? "",
    model: data.model ?? "unknown",
  };
}

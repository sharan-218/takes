import type { Angle, Format, Pacing } from "../types";

const ANGLE_PACING_AFFINITY: Record<Angle, Pacing[]> = {
  unboxing: ["fast-cut", "talking-head", "cinematic"],
  testimonial: ["talking-head", "cinematic"],
  demo: ["fast-cut", "talking-head"],
  "problem-solution": ["fast-cut", "cinematic"],
  pov: ["cinematic", "asmr"],
  "before-after": ["cinematic", "fast-cut"],
  comparison: ["fast-cut", "cinematic", "talking-head"],
};

const FORMAT_AFFINITY: Record<Format, Angle[]> = {
  "9x16": ["unboxing", "pov", "demo", "testimonial", "before-after"],
  "1x1": ["testimonial", "demo", "comparison", "problem-solution"],
  "16x9": ["demo", "testimonial", "comparison"],
  "6s": ["unboxing", "pov", "demo"],
  "15s": ["testimonial", "demo", "problem-solution", "comparison"],
  "30s": ["testimonial", "demo", "comparison", "before-after", "problem-solution"],
};

export function fitScoreFor(angle: Angle, pacing: Pacing, format: Format): number {
  let score = 60;
  if (ANGLE_PACING_AFFINITY[angle]?.includes(pacing)) score += 25;
  if (FORMAT_AFFINITY[format]?.includes(angle)) score += 15;
  return Math.min(100, score);
}

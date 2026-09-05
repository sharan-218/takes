import type { HookScore, Angle } from "../types";

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function hasNumber(s: string): boolean {
  return /\d/.test(s);
}

function isImperative(s: string): boolean {
  const first = s.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return ["stop", "watch", "look", "see", "try", "feel", "hear", "get", "grab", "discover"].includes(first);
}

function isQuestion(s: string): boolean {
  return s.trim().endsWith("?");
}

function specificity(s: string): number {
  let score = 50;
  const wc = wordCount(s);
  if (wc >= 3 && wc <= 6) score += 25;
  if (hasNumber(s)) score += 20;
  const specific = /\b(rupee|minute|second|day|week|month|inch|cm|ml|kg|litre|liter)\b/i.test(s);
  if (specific) score += 10;
  if (s.length > 60) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function curiosityGap(s: string): number {
  let score = 30;
  if (isImperative(s)) score += 30;
  if (isQuestion(s)) score += 25;
  if (/[.!?]$/.test(s.trim())) score += 10;
  if (wordCount(s) <= 4) score += 15;
  if (wordCount(s) > 10) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function targetFit(s: string, angle: Angle): number {
  const lower = s.toLowerCase();
  const angleWords: Record<Angle, string[]> = {
    unboxing: ["first", "look", "open", "reveal", "unbox"],
    testimonial: ["honestly", "couldn't", "going back", "switched", "tried"],
    demo: ["see", "watch", "works", "how", "set up"],
    "problem-solution": ["fix", "stop", "no more", "finally"],
    pov: ["you", "your", "imagine"],
    "before-after": ["before", "after", "look", "difference"],
    comparison: ["vs", "instead", "rather", "switched"],
  };
  const hits = angleWords[angle]?.filter((w) => lower.includes(w)) ?? [];
  return Math.min(100, 40 + hits.length * 20);
}

function brevity(s: string): number {
  const wc = wordCount(s);
  if (wc <= 3) return 100;
  if (wc <= 5) return 90;
  if (wc <= 7) return 75;
  if (wc <= 10) return 55;
  return 30;
}

function rationale(s: string, angle: Angle, parts: { specificity: number; curiosityGap: number; targetFit: number; brevity: number }): string {
  const why: string[] = [];
  if (parts.specificity >= 80) why.push("specific and concrete");
  else if (parts.specificity < 40) why.push("vague, could be sharper");
  if (parts.curiosityGap >= 75) why.push("strong pattern break");
  if (parts.brevity >= 90) why.push("punchy length");
  else if (parts.brevity < 50) why.push("too long for a hook");
  if (parts.targetFit >= 70) why.push(`fits ${angle} angle`);
  else why.push(`weak fit for ${angle}`);
  return why.join(", ");
}

export function scoreHook(text: string, angle: Angle): HookScore {
  const sp = specificity(text);
  const cg = curiosityGap(text);
  const tf = targetFit(text, angle);
  const br = brevity(text);
  const total = Math.round(sp * 0.3 + cg * 0.3 + tf * 0.25 + br * 0.15);
  return {
    specificity: sp,
    curiosityGap: cg,
    targetFit: tf,
    brevity: br,
    total,
    rationale: rationale(text, angle, { specificity: sp, curiosityGap: cg, targetFit: tf, brevity: br }),
  };
}

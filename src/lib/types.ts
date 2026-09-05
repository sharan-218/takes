export type SettingId = "kitchen" | "street" | "studio" | "gym" | "office";

export interface FaceDescriptor {
  id: string;
  faceRef: string;
  identityPrompt: string;
  expression: "neutral" | "smile" | "talking" | "surprised";
  skinTone: "warm" | "cool" | "neutral";
  age: "young-adult" | "adult" | "mature";
}

export interface ProductDescriptor {
  id: string;
  productRef: string;
  name: string;
  category: "beauty" | "tech" | "fashion" | "food" | "beverage" | "wellness";
  scaleRef: "handheld" | "tabletop" | "worn" | "wielded";
  suggestedAngles: string[];
}

export interface SettingDescriptor {
  id: SettingId;
  name: string;
  prompt: string;
  lighting: string;
  lens: string;
  mood: string;
  colorTempK: number;
  backgroundHint: string;
}

export interface CastLock {
  id: string;
  label: string;
  createdAt: number;
  face: FaceDescriptor;
  product: ProductDescriptor;
  setting: SettingDescriptor;
  brandVoice: string;
}

export type Angle =
  | "unboxing"
  | "testimonial"
  | "demo"
  | "problem-solution"
  | "pov"
  | "before-after"
  | "comparison";

export type Pacing = "fast-cut" | "talking-head" | "cinematic" | "asmr";

export type Format = "9x16" | "1x1" | "16x9" | "6s" | "15s" | "30s";

export interface Hook {
  id: string;
  text: string;
  source: "library" | "custom";
}

export interface MatrixConfig {
  castLockId: string;
  hooks: Hook[];
  angles: Angle[];
  pacing: Pacing[];
  formats: Format[];
  maxVariants: number;
}

export interface RenderStep {
  kind: "video" | "image" | "text" | "audio";
  description: string;
  durationMs?: number;
  modelHint?: string;
}

export interface RenderPlan {
  variantId: string;
  hook: Hook;
  angle: Angle;
  pacing: Pacing;
  format: Format;
  fullPrompt: string;
  overlayText: string;
  caption: string;
  steps: RenderStep[];
  estimatedSeconds: number;
}

export interface Variant extends RenderPlan {
  status: "planned" | "rendering" | "ready" | "approved" | "rejected";
  thumbnailUrl?: string;
  videoUrl?: string;
  libraryKey?: string;
  hookScore: HookScore;
  fitScore: number;
  compositeScore: number;
}

export interface HookScore {
  specificity: number;
  curiosityGap: number;
  targetFit: number;
  brevity: number;
  total: number;
  rationale: string;
}

export type VariantStatus = Variant["status"];

export interface ApprovalState {
  approved: Set<string>;
  rejected: Set<string>;
}

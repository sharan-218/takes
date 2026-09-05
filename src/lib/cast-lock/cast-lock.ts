import type { FaceDescriptor, ProductDescriptor, CastLock } from "../types";

async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load image"));
    img.src = src;
  });
}

function hashString(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

function averageLuma(imageData: ImageData): number {
  let sum = 0;
  const d = imageData.data;
  const step = 4 * 16;
  let n = 0;
  for (let i = 0; i < d.length; i += step) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    n++;
  }
  return n ? sum / n : 128;
}

function skinToneFromLuma(luma: number): FaceDescriptor["skinTone"] {
  if (luma > 200) return "warm";
  if (luma < 140) return "cool";
  return "neutral";
}

async function analyzeFace(file: File): Promise<FaceDescriptor> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const w = 64;
  const h = 64;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const luma = averageLuma(data);
  const id = "face_" + hashString(dataUrl.slice(0, 1024));
  const expression: FaceDescriptor["expression"] = luma > 170 ? "smile" : "neutral";
  return {
    id,
    faceRef: dataUrl,
    identityPrompt: `same person across all shots, consistent facial identity, locked identity anchor ${id}`,
    expression,
    skinTone: skinToneFromLuma(luma),
    age: "adult",
  };
}

async function analyzeProduct(file: File, name: string, category: ProductDescriptor["category"]): Promise<ProductDescriptor> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const aspect = img.width / Math.max(1, img.height);
  const scale: ProductDescriptor["scaleRef"] =
    aspect > 1.4 ? "wielded" : aspect > 0.8 ? "tabletop" : "handheld";
  const id = "prod_" + hashString(name + dataUrl.slice(0, 512));
  return {
    id,
    productRef: dataUrl,
    name,
    category,
    scaleRef: scale,
    suggestedAngles: ["hero", "in-hand", "macro detail", "in-context"],
  };
}

export async function buildCastLock(params: {
  faceFile: File;
  productFile: File;
  productName: string;
  productCategory: ProductDescriptor["category"];
  settingId: CastLock["setting"]["id"];
  brandVoice: string;
  label: string;
}): Promise<CastLock> {
  const { SETTINGS } = await import("../settings/settings");
  const face = await analyzeFace(params.faceFile);
  const product = await analyzeProduct(
    params.productFile,
    params.productName,
    params.productCategory
  );
  const setting = SETTINGS[params.settingId];
  const lockHash = hashString(face.id + product.id + setting.id + params.brandVoice);
  return {
    id: "lock_" + lockHash,
    label: params.label || `${product.name} × ${setting.name}`,
    createdAt: Date.now(),
    face,
    product,
    setting,
    brandVoice: params.brandVoice,
  };
}

export function castLockToAnchorString(lock: CastLock): string {
  return [
    `actor: ${lock.face.id}`,
    `identity: ${lock.face.identityPrompt}`,
    `expression: ${lock.face.expression}`,
    `product: ${lock.product.name} (${lock.product.id})`,
    `product-scale: ${lock.product.scaleRef}`,
    `setting: ${lock.setting.prompt}`,
    `lighting: ${lock.setting.lighting}`,
    `lens: ${lock.setting.lens}`,
    `mood: ${lock.setting.mood}`,
    `brand-voice: ${lock.brandVoice}`,
  ].join(" | ");
}

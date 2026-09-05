import { findLibraryEntry, pickAssetFor, type LibraryAsset } from "./library";
import type { Format, Variant } from "../types";

const FORMAT_DIMENSIONS: Record<Format, { w: number; h: number }> = {
  "9x16": { w: 1080, h: 1920 },
  "1x1": { w: 1080, h: 1080 },
  "16x9": { w: 1920, h: 1080 },
  "6s": { w: 1080, h: 1920 },
  "15s": { w: 1080, h: 1920 },
  "30s": { w: 1080, h: 1920 },
};

export interface CompositeResult {
  videoBlob: Blob;
  videoUrl: string;
  width: number;
  height: number;
  sourceAsset: LibraryAsset | null;
}

export function variantTags(v: Variant): string[] {
  return [v.angle, v.pacing, v.format];
}

export function findHeroAssetFor(v: Variant, fallbackCastLockId: string): LibraryAsset | null {
  const entry = findLibraryEntry(fallbackCastLockId);
  const asset = pickAssetFor(entry, variantTags(v));
  return asset ?? null;
}

function loadVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.src = url;
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.onloadedmetadata = () => resolve(v);
    v.onerror = () => reject(new Error("failed to load hero asset " + url));
  });
}

function smartCropRect(srcW: number, srcH: number, targetW: number, targetH: number): { x: number; y: number; w: number; h: number } {
  const srcAR = srcW / srcH;
  const tgtAR = targetW / targetH;
  if (srcAR > tgtAR) {
    const newW = srcH * tgtAR;
    const x = (srcW - newW) / 2;
    return { x, y: 0, w: newW, h: srcH };
  }
  const newH = srcW / tgtAR;
  const y = (srcH - newH) / 2;
  return { x: 0, y, w: srcW, h: newH };
}

async function drawVideoFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  targetW: number,
  targetH: number
) {
  const rect = smartCropRect(video.videoWidth, video.videoHeight, targetW, targetH);
  ctx.canvas.width = targetW;
  ctx.canvas.height = targetH;
  ctx.drawImage(
    video,
    rect.x,
    rect.y,
    rect.w,
    rect.h,
    0,
    0,
    targetW,
    targetH
  );
}

function drawOverlay(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  const fontSize = Math.round(h * 0.075);
  ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const metrics = ctx.measureText(text);
  const padX = fontSize * 0.6;
  const padY = fontSize * 0.35;
  const boxW = metrics.width + padX * 2;
  const boxH = fontSize + padY * 2;
  const x = (w - boxW) / 2;
  const y = h * 0.08;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x, y, boxW, boxH);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, w / 2, y + padY);
}

function drawFooter(ctx: CanvasRenderingContext2D, caption: string, w: number, h: number) {
  const lines = wrapText(ctx, caption, w * 0.86);
  const fontSize = Math.round(h * 0.028);
  ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  const bgH = lines.length * (fontSize * 1.4) + fontSize;
  ctx.fillRect(0, h - bgH, w, bgH);
  ctx.fillStyle = "#fff";
  let y = h - fontSize;
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], w / 2, y);
    y -= fontSize * 1.4;
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? current + " " + w : w;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function compositeVariant(
  variant: Variant,
  fallbackCastLockId: string
): Promise<CompositeResult> {
  const dims = FORMAT_DIMENSIONS[variant.format];
  const hero = findHeroAssetFor(variant, fallbackCastLockId);
  const canvas = document.createElement("canvas");
  canvas.width = dims.w;
  canvas.height = dims.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, dims.w, dims.h);
  if (hero) {
    const v = await loadVideoElement(hero.url);
    v.currentTime = 0.25;
    await new Promise<void>((r) => v.addEventListener("seeked", () => r(), { once: true }));
    await drawVideoFrame(ctx, v, dims.w, dims.h);
  } else {
    const grad = ctx.createLinearGradient(0, 0, dims.w, dims.h);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, "#16213e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dims.w, dims.h);
  }
  drawOverlay(ctx, variant.overlayText, dims.w, dims.h);
  drawFooter(ctx, variant.caption, dims.w, dims.h);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.86
    );
  });
  const url = URL.createObjectURL(blob);
  return { videoBlob: blob, videoUrl: url, width: dims.w, height: dims.h, sourceAsset: hero };
}

export async function compositePoster(variant: Variant, fallbackCastLockId: string): Promise<{ url: string }> {
  const res = await compositeVariant(variant, fallbackCastLockId);
  return { url: res.videoUrl };
}

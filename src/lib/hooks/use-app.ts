"use client";

import { create } from "zustand";
import type { CastLock, Hook, MatrixConfig, Variant, Angle, Pacing, Format, VariantStatus } from "../types";
import { HOOK_LIBRARY } from "../settings/hooks-library";
import { expandMatrix, plansToVariants } from "../orchestrator/orchestrator";
import { compositeVariant } from "../compositor/compositor";
import { generateLive } from "../compositor/live";

const STARTER_HOOKS: Hook[] = HOOK_LIBRARY.slice(0, 6).map((h) => ({ id: h.id, text: h.text, source: "library" as const }));
const STARTER_ANGLES: Angle[] = ["unboxing", "testimonial", "demo"];
const STARTER_PACING: Pacing[] = ["fast-cut", "talking-head"];
const STARTER_FORMATS: Format[] = ["9x16"];

interface AppState {
  castLock: CastLock | null;
  fallbackLibraryId: string;
  hooks: Hook[];
  angles: Angle[];
  pacing: Pacing[];
  formats: Format[];
  maxVariants: number;
  variants: Variant[];
  selectedVariantId: string | null;
  busy: boolean;
  progressLabel: string;
  setCastLock: (lock: CastLock) => void;
  setFallbackLibraryId: (id: string) => void;
  toggleHook: (id: string) => void;
  addCustomHook: (text: string) => void;
  toggleAngle: (a: Angle) => void;
  togglePacing: (p: Pacing) => void;
  toggleFormat: (f: Format) => void;
  setMaxVariants: (n: number) => void;
  selectVariant: (id: string | null) => void;
  setVariantStatus: (id: string, status: VariantStatus) => void;
  renderMode: "library" | "live";
  setRenderMode: (m: "library" | "live") => void;
  liveModeAvailable: boolean | null;
  refreshLiveMode: () => Promise<void>;
  generate: () => Promise<void>;
  renderVariant: (id: string) => Promise<void>;
  renderVariantLive: (id: string) => Promise<void>;
  renderAll: () => Promise<void>;
  approveAll: () => void;
  rejectAll: () => void;
  exportApproved: () => void;
  reset: () => void;
}

export const useApp = create<AppState>((set, get) => ({
  castLock: null,
  fallbackLibraryId: "lock_kitchen_serum",
  hooks: STARTER_HOOKS,
  angles: STARTER_ANGLES,
  pacing: STARTER_PACING,
  formats: STARTER_FORMATS,
  maxVariants: 18,
  variants: [],
  selectedVariantId: null,
  busy: false,
  progressLabel: "",
  renderMode: "library",
  liveModeAvailable: null,
  setCastLock: (lock) => set({ castLock: lock }),
  setFallbackLibraryId: (id) => set({ fallbackLibraryId: id }),
  toggleHook: (id) =>
    set((s) => ({
      hooks: s.hooks.some((h) => h.id === id) ? s.hooks.filter((h) => h.id !== id) : [...s.hooks, s.hooks.find((h) => h.id === id) ?? { id, text: id, source: "library" }],
    })),
  addCustomHook: (text) =>
    set((s) => {
      const id = "custom_" + Math.random().toString(36).slice(2, 8);
      return { hooks: [...s.hooks, { id, text, source: "custom" }] };
    }),
  toggleAngle: (a) => set((s) => ({ angles: s.angles.includes(a) ? s.angles.filter((x) => x !== a) : [...s.angles, a] })),
  togglePacing: (p) => set((s) => ({ pacing: s.pacing.includes(p) ? s.pacing.filter((x) => x !== p) : [...s.pacing, p] })),
  toggleFormat: (f) => set((s) => ({ formats: s.formats.includes(f) ? s.formats.filter((x) => x !== f) : [...s.formats, f] })),
  setMaxVariants: (n) => set({ maxVariants: Math.max(1, Math.min(50, n)) }),
  selectVariant: (id) => set({ selectedVariantId: id }),
  setVariantStatus: (id, status) =>
    set((s) => ({ variants: s.variants.map((v) => (v.variantId === id ? { ...v, status } : v)) })),
  setRenderMode: (m) => set({ renderMode: m }),
  refreshLiveMode: async () => {
    try {
      const res = await fetch("/api/generate");
      const data = (await res.json()) as { liveModeEnabled: boolean };
      set({ liveModeAvailable: data.liveModeEnabled, renderMode: data.liveModeEnabled ? "live" : "library" });
    } catch {
      set({ liveModeAvailable: false });
    }
  },
  generate: async () => {
    const { castLock, hooks, angles, pacing, formats, maxVariants } = get();
    if (!castLock) return;
    const cfg: MatrixConfig = {
      castLockId: castLock.id,
      hooks,
      angles,
      pacing,
      formats,
      maxVariants,
    };
    const plans = expandMatrix(castLock, cfg);
    const variants = plansToVariants(plans).sort((a, b) => b.compositeScore - a.compositeScore);
    set({ variants, selectedVariantId: variants[0]?.variantId ?? null });
  },
  renderVariant: async (id) => {
    const { variants, fallbackLibraryId } = get();
    const v = variants.find((x) => x.variantId === id);
    if (!v) return;
    set({ busy: true, progressLabel: `Rendering ${v.overlayText}…` });
    try {
      const res = await compositeVariant(v, fallbackLibraryId);
      set((s) => ({
        variants: s.variants.map((x) =>
          x.variantId === id
            ? { ...x, status: "ready" as const, videoUrl: res.videoUrl, thumbnailUrl: res.videoUrl }
            : x
        ),
        busy: false,
        progressLabel: "",
      }));
    } catch {
      set({ busy: false, progressLabel: "render failed" });
    }
  },
  renderAll: async () => {
    const { variants } = get();
    for (const v of variants) {
      await get().renderVariant(v.variantId);
    }
  },
  renderVariantLive: async (id) => {
    const { variants, castLock } = get();
    const v = variants.find((x) => x.variantId === id);
    if (!v || !castLock) return;
    set({ busy: true, progressLabel: `Live rendering ${v.overlayText}…` });
    try {
      const res = await generateLive(v, castLock);
      set((s) => ({
        variants: s.variants.map((x) =>
          x.variantId === id
            ? { ...x, status: "ready" as const, videoUrl: res.videoUrl, thumbnailUrl: res.videoUrl }
            : x
        ),
        busy: false,
        progressLabel: "✓ live render done",
      }));
      setTimeout(() => {
        if (get().progressLabel === "✓ live render done") {
          set({ progressLabel: "" });
        }
      }, 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "live render failed";
      set({ busy: false, progressLabel: `✗ ${msg}` });
    }
  },
  approveAll: () =>
    set((s) => ({ variants: s.variants.map((v) => ({ ...v, status: "approved" as VariantStatus })) })),
  rejectAll: () =>
    set((s) => ({ variants: s.variants.map((v) => ({ ...v, status: "rejected" as VariantStatus })) })),
  exportApproved: () => {
    const approved = get().variants.filter((v) => v.status === "approved");
    const manifest = approved.map((v) => ({
      variantId: v.variantId,
      hook: v.hook.text,
      angle: v.angle,
      pacing: v.pacing,
      format: v.format,
      hookScore: v.hookScore.total,
      fitScore: v.fitScore,
      compositeScore: v.compositeScore,
      videoUrl: v.videoUrl,
    }));
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "continuity-matrix-export.json";
    a.click();
    URL.revokeObjectURL(url);
  },
  reset: () =>
    set({
      variants: [],
      selectedVariantId: null,
    }),
}));

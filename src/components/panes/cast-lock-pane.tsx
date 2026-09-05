"use client";

import { useState } from "react";
import { Card, Button, Chip } from "../ui/primitives";
import { useApp } from "@/lib/hooks/use-app";
import { SETTING_LIST, SETTINGS } from "@/lib/settings/settings";
import { LIBRARY } from "@/lib/compositor/library";
import { buildCastLock } from "@/lib/cast-lock/cast-lock";
import type { ProductDescriptor, SettingId } from "@/lib/types";

const PRODUCT_CATEGORIES: { value: ProductDescriptor["category"]; label: string }[] = [
  { value: "beauty", label: "Beauty" },
  { value: "tech", label: "Tech" },
  { value: "fashion", label: "Fashion" },
  { value: "food", label: "Food" },
  { value: "beverage", label: "Beverage" },
  { value: "wellness", label: "Wellness" },
];

export function CastLockPane() {
  const { castLock, setCastLock, fallbackLibraryId, setFallbackLibraryId, busy, progressLabel } = useApp();
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("Glow Serum 30ml");
  const [category, setCategory] = useState<ProductDescriptor["category"]>("beauty");
  const [settingId, setSettingId] = useState<SettingId>("kitchen");
  const [brandVoice, setBrandVoice] = useState("Warm, confident, modern Indian wellness.");
  const [label, setLabel] = useState("");
  const [building, setBuilding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onBuild() {
    if (!faceFile || !productFile) {
      setErr("Drop in a face and a product to lock the cast.");
      return;
    }
    setErr(null);
    setBuilding(true);
    try {
      const lock = await buildCastLock({
        faceFile,
        productFile,
        productName,
        productCategory: category,
        settingId,
        brandVoice,
        label,
      });
      setCastLock(lock);
      setFallbackLibraryId(lock.id);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="label mb-2">Cast Lock</div>
        <div className="text-ink2 text-sm leading-relaxed">
          Lock the actor, product, and setting once. Every variant in the matrix carries the same identity
          anchor — so the face, the outfit, the product, and the lighting stay continuous across cuts.
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label mb-1.5">Face</div>
            <label className="block aspect-[3/4] rounded-md border border-dashed border-line bg-bg hover:border-accent/60 cursor-pointer transition overflow-hidden relative">
              {faceFile ? (
                <img src={URL.createObjectURL(faceFile)} alt="face" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink3 text-xs">
                  <div className="text-2xl mb-1">+</div>
                  drop face
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFaceFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div>
            <div className="label mb-1.5">Product</div>
            <label className="block aspect-[3/4] rounded-md border border-dashed border-line bg-bg hover:border-accent/60 cursor-pointer transition overflow-hidden relative">
              {productFile ? (
                <img src={URL.createObjectURL(productFile)} alt="product" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink3 text-xs">
                  <div className="text-2xl mb-1">+</div>
                  drop product
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="label mb-1">Product name</div>
            <input
              className="w-full rounded-md bg-bg border border-line px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Glow Serum 30ml"
            />
          </div>
          <div>
            <div className="label mb-1">Category</div>
            <select
              className="w-full rounded-md bg-bg border border-line px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductDescriptor["category"])}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <div className="label mb-1.5">Setting</div>
          <div className="flex flex-wrap gap-1.5">
            {SETTING_LIST.map((s) => (
              <Chip key={s.id} on={settingId === s.id} onClick={() => setSettingId(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
          <div className="text-[11px] text-ink3 mt-1.5">{SETTINGS[settingId].prompt}</div>
        </div>

        <div className="mt-3">
          <div className="label mb-1">Brand voice</div>
          <input
            className="w-full rounded-md bg-bg border border-line px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Warm, confident, modern Indian wellness."
          />
        </div>

        <div className="mt-3">
          <div className="label mb-1">Lock label (optional)</div>
          <input
            className="w-full rounded-md bg-bg border border-line px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="auto-generated from product × setting"
          />
        </div>

        {err && <div className="mt-3 text-xs text-bad">{err}</div>}

        <div className="mt-4 flex items-center justify-between">
          <Button onClick={onBuild} disabled={building || busy} variant="primary">
            {building ? "Locking…" : castLock ? "Rebuild Cast Lock" : "Lock the cast"}
          </Button>
          {castLock && (
            <div className="text-[11px] text-ink3 font-mono">
              {castLock.id} · {castLock.face.id} · {castLock.product.id}
            </div>
          )}
        </div>
        {progressLabel && <div className="mt-2 text-[11px] text-ink3">{progressLabel}</div>}
      </Card>

      <Card>
        <div className="label mb-2">Or pick a pre-built cast</div>
        <div className="grid grid-cols-1 gap-2">
          {LIBRARY.map((entry) => (
            <button
              key={entry.castLockId}
              onClick={() => {
                setFallbackLibraryId(entry.castLockId);
                setCastLock({
                  id: entry.castLockId,
                  label: entry.label,
                  createdAt: Date.now(),
                  face: { id: "face_lib", faceRef: "", identityPrompt: "library actor", expression: "smile", skinTone: "neutral", age: "adult" },
                  product: { id: "prod_lib", productRef: "", name: entry.label, category: "wellness", scaleRef: "handheld", suggestedAngles: [] },
                  setting: SETTINGS.kitchen,
                  brandVoice,
                });
              }}
              className={`text-left rounded-md border px-3 py-2 transition ${
                fallbackLibraryId === entry.castLockId
                  ? "border-accent/60 bg-accent/5"
                  : "border-line bg-bg hover:border-ink3"
              }`}
            >
              <div className="text-sm">{entry.label}</div>
              <div className="text-[10px] text-ink3 font-mono">{entry.castLockId} · {entry.assets.length} hero assets</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

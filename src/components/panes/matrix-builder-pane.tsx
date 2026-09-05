"use client";

import { useState } from "react";
import { Card, Button, Chip } from "../ui/primitives";
import { useApp } from "@/lib/hooks/use-app";
import { HOOK_LIBRARY } from "@/lib/settings/hooks-library";
import type { Angle, Format, Pacing } from "@/lib/types";

const ANGLES: { id: Angle; label: string; sub: string }[] = [
  { id: "unboxing", label: "Unboxing", sub: "first reaction" },
  { id: "testimonial", label: "Testimonial", sub: "speak to camera" },
  { id: "demo", label: "Demo", sub: "in use" },
  { id: "problem-solution", label: "Problem → Solution", sub: "transformation" },
  { id: "pov", label: "POV", sub: "first-person" },
  { id: "before-after", label: "Before / After", sub: "visible change" },
  { id: "comparison", label: "Comparison", sub: "vs. alternative" },
];

const PACINGS: { id: Pacing; label: string }[] = [
  { id: "fast-cut", label: "Fast cut" },
  { id: "talking-head", label: "Talking head" },
  { id: "cinematic", label: "Cinematic" },
  { id: "asmr", label: "ASMR" },
];

const FORMATS: { id: Format; label: string; sub: string }[] = [
  { id: "9x16", label: "9:16", sub: "Reels / TikTok" },
  { id: "1x1", label: "1:1", sub: "Feed" },
  { id: "16x9", label: "16:9", sub: "YouTube" },
  { id: "6s", label: "6s", sub: "Pre-roll" },
  { id: "15s", label: "15s", sub: "Standard" },
  { id: "30s", label: "30s", sub: "Long spot" },
];

export function MatrixBuilderPane() {
  const {
    castLock,
    hooks,
    toggleHook,
    addCustomHook,
    angles,
    toggleAngle,
    pacing,
    togglePacing,
    formats,
    toggleFormat,
    maxVariants,
    setMaxVariants,
    generate,
    renderAll,
    renderVariantLive,
    renderMode,
    liveModeAvailable,
    busy,
  } = useApp();
  const [customHook, setCustomHook] = useState("");
  const variantCount = Math.min(maxVariants, hooks.length * angles.length * pacing.length * formats.length);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="label mb-2">Matrix Builder</div>
        <div className="text-ink2 text-sm leading-relaxed">
          Pick the axes. The orchestrator derives a deterministic RenderPlan for every cell — same cast
          lock, hook overlay, caption, smart-crop, and platform-correct export.
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="label">Hooks</div>
          <div className="text-[11px] text-ink3">{hooks.length} selected · {HOOK_LIBRARY.length} in library</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HOOK_LIBRARY.map((h) => (
            <Chip key={h.id} on={hooks.some((x) => x.id === h.id)} onClick={() => toggleHook(h.id)}>
              {h.text}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={customHook}
            onChange={(e) => setCustomHook(e.target.value)}
            placeholder="Add a custom hook…"
            className="flex-1 rounded-md bg-bg border border-line px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent"
            onKeyDown={(e) => {
              if (e.key === "Enter" && customHook.trim()) {
                addCustomHook(customHook.trim());
                setCustomHook("");
              }
            }}
          />
          <Button
            onClick={() => {
              if (customHook.trim()) {
                addCustomHook(customHook.trim());
                setCustomHook("");
              }
            }}
          >
            Add
          </Button>
        </div>
      </Card>

      <Card>
        <div className="label mb-2">Angles</div>
        <div className="grid grid-cols-2 gap-2">
          {ANGLES.map((a) => (
            <button
              key={a.id}
              onClick={() => toggleAngle(a.id)}
              className={`text-left rounded-md border px-2.5 py-1.5 transition ${
                angles.includes(a.id) ? "border-accent/60 bg-accent/5" : "border-line bg-bg hover:border-ink3"
              }`}
            >
              <div className="text-sm">{a.label}</div>
              <div className="text-[10px] text-ink3">{a.sub}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="label mb-2">Pacing</div>
          <div className="flex flex-wrap gap-1.5">
            {PACINGS.map((p) => (
              <Chip key={p.id} on={pacing.includes(p.id)} onClick={() => togglePacing(p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </Card>
        <Card>
          <div className="label mb-2">Formats</div>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((f) => (
              <Chip key={f.id} on={formats.includes(f.id)} onClick={() => toggleFormat(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="label mb-1">Max variants</div>
            <div className="text-2xl font-semibold text-ink">
              {variantCount}
              <span className="text-sm text-ink3 font-normal"> / 50</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={50}
              value={maxVariants}
              onChange={(e) => setMaxVariants(parseInt(e.target.value, 10))}
              className="accent-accent"
            />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-bg/80 backdrop-blur border-t border-line flex items-center gap-2">
        <Button
          variant="primary"
          disabled={!castLock || busy || hooks.length === 0 || angles.length === 0 || pacing.length === 0 || formats.length === 0}
          onClick={generate}
        >
          Generate Matrix
        </Button>
        {renderMode === "live" && liveModeAvailable ? (
          <Button
            disabled={!castLock || busy}
            onClick={async () => {
              for (const v of (useApp.getState().variants)) {
                await renderVariantLive(v.variantId);
              }
            }}
          >
            Render all (Live)
          </Button>
        ) : (
          <Button disabled={!castLock || busy} onClick={renderAll}>
            Render all
          </Button>
        )}
        <div className="ml-auto text-[11px] text-ink3">
          {castLock ? `cast: ${castLock.id}` : "lock a cast to begin"}
          {renderMode === "live" && liveModeAvailable ? " · live mode" : ""}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Card, Button } from "../ui/primitives";
import { PreviewMedia } from "../ui/preview-media";
import { useApp } from "@/lib/hooks/use-app";

export function VariantGridPane() {
  const {
    variants,
    selectedVariantId,
    selectVariant,
    setVariantStatus,
    renderVariant,
    renderVariantLive,
    renderMode,
    setRenderMode,
    liveModeAvailable,
    refreshLiveMode,
    approveAll,
    rejectAll,
    exportApproved,
    busy,
    progressLabel,
  } = useApp();

  useEffect(() => {
    refreshLiveMode();
  }, [refreshLiveMode]);

  useEffect(() => {
    if (!selectedVariantId && variants.length) selectVariant(variants[0].variantId);
  }, [selectedVariantId, variants, selectVariant]);

  const selected = variants.find((v) => v.variantId === selectedVariantId) ?? null;
  const approved = variants.filter((v) => v.status === "approved").length;

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="label mb-2">Variant Grid</div>
        <div className="text-ink2 text-sm max-w-sm">
          Lock a cast, choose your hooks × angles × pacing × formats, then hit{" "}
          <span className="text-ink">Generate Matrix</span> to populate this grid.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="label">Variant Grid</div>
          <div className="text-sm text-ink2">
            {variants.length} variants · <span className="text-ok">{approved} approved</span>
            {liveModeAvailable === true && (
              <span className="ml-2 chip-on">live mode ready</span>
            )}
            {liveModeAvailable === false && (
              <span className="ml-2 chip">library mode</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {liveModeAvailable === true && (
            <div className="flex items-center rounded-md border border-line overflow-hidden">
              <button
                onClick={() => setRenderMode("library")}
                className={`px-2 py-1 text-xs ${renderMode === "library" ? "bg-line text-ink" : "text-ink3 hover:text-ink"}`}
              >
                library
              </button>
              <button
                onClick={() => setRenderMode("live")}
                className={`px-2 py-1 text-xs ${renderMode === "live" ? "bg-accent text-black" : "text-ink3 hover:text-ink"}`}
              >
                live
              </button>
            </div>
          )}
          <Button onClick={approveAll} disabled={busy}>
            Approve all
          </Button>
          <Button onClick={rejectAll} disabled={busy}>
            Reject all
          </Button>
          <Button variant="primary" onClick={exportApproved} disabled={approved === 0}>
            Export campaign kit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 360px)" }}>
        {variants.map((v) => (
          <button
            key={v.variantId}
            onClick={() => selectVariant(v.variantId)}
            className={`text-left rounded-lg border bg-panel overflow-hidden transition relative ${
              selectedVariantId === v.variantId ? "border-accent" : "border-line hover:border-ink3"
            }`}
          >
            <div className="aspect-[9/16] bg-bg relative">
              {v.thumbnailUrl ? (
                <PreviewMedia url={v.thumbnailUrl} alt={v.overlayText} className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-ink3 text-xs">{busy && progressLabel ? "rendering…" : "no render yet"}</div>
              )}
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                <span className="rounded bg-black/70 backdrop-blur px-1.5 py-0.5 text-[10px] font-mono text-ink2">
                  {v.format}
                </span>
                <span className="rounded bg-black/70 backdrop-blur px-1.5 py-0.5 text-[10px] font-mono text-ink2">
                  {v.angle}
                </span>
              </div>
              <div className="absolute top-1.5 right-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    v.compositeScore >= 80
                      ? "bg-ok/20 text-ok"
                      : v.compositeScore >= 65
                      ? "bg-warn/20 text-warn"
                      : "bg-line text-ink2"
                  }`}
                >
                  {v.compositeScore}
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
                <div className="text-[10px] font-semibold tracking-wide text-white uppercase line-clamp-2">
                  {v.overlayText}
                </div>
              </div>
            </div>
            <div className="p-2 flex items-center justify-between text-[10px] text-ink3">
              <span className="font-mono">{v.variantId}</span>
              <span className={`uppercase font-semibold ${
                v.status === "approved" ? "text-ok" :
                v.status === "rejected" ? "text-bad" :
                v.status === "ready" ? "text-accent2" :
                "text-ink3"
              }`}>{v.status}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <Card className="mt-2">
          <div className="flex items-start gap-4">
            <div className="w-32 aspect-[9/16] rounded-md overflow-hidden bg-bg border border-line relative">
              {selected.thumbnailUrl ? (
                <PreviewMedia url={selected.thumbnailUrl} alt="" className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-ink3 text-[10px]">no render</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="chip-on uppercase">{selected.angle}</span>
                <span className="chip uppercase">{selected.pacing}</span>
                <span className="chip uppercase">{selected.format}</span>
                <span className="chip">score {selected.compositeScore}</span>
              </div>
              <div className="text-lg font-semibold mb-1">{selected.overlayText}</div>
              <div className="text-xs text-ink2 mb-2">&ldquo;{selected.caption}&rdquo;</div>
              <pre className="text-[10px] text-ink3 font-mono whitespace-pre-wrap break-words bg-bg/60 p-2 rounded border border-line max-h-40 overflow-y-auto">
                {selected.fullPrompt}
              </pre>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {renderMode === "live" && liveModeAvailable ? (
                  <Button variant="primary" onClick={() => renderVariantLive(selected.variantId)} disabled={busy}>
                    {selected.status === "ready" ? "Re-render (Live)" : "Generate (Live)"}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => renderVariant(selected.variantId)} disabled={busy}>
                    {selected.status === "ready" ? "Re-render" : "Render"}
                  </Button>
                )}
                <Button onClick={() => setVariantStatus(selected.variantId, "approved")}>Approve</Button>
                <Button onClick={() => setVariantStatus(selected.variantId, "rejected")}>Reject</Button>
                <div className="ml-auto text-[10px] text-ink3 font-mono">{selected.steps.length} render steps</div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <div className="rounded bg-bg border border-line p-2">
                  <div className="text-[10px] text-ink3 uppercase">Specificity</div>
                  <div className="text-sm font-semibold">{selected.hookScore.specificity}</div>
                </div>
                <div className="rounded bg-bg border border-line p-2">
                  <div className="text-[10px] text-ink3 uppercase">Curiosity</div>
                  <div className="text-sm font-semibold">{selected.hookScore.curiosityGap}</div>
                </div>
                <div className="rounded bg-bg border border-line p-2">
                  <div className="text-[10px] text-ink3 uppercase">Target fit</div>
                  <div className="text-sm font-semibold">{selected.hookScore.targetFit}</div>
                </div>
                <div className="rounded bg-bg border border-line p-2">
                  <div className="text-[10px] text-ink3 uppercase">Brevity</div>
                  <div className="text-sm font-semibold">{selected.hookScore.brevity}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-ink3 italic">{selected.hookScore.rationale}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

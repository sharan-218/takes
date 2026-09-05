"use client";

import { CastLockPane } from "@/components/panes/cast-lock-pane";
import { MatrixBuilderPane } from "@/components/panes/matrix-builder-pane";
import { VariantGridPane } from "@/components/panes/variant-grid-pane";
import { useApp } from "@/lib/hooks/use-app";

export default function Home() {
  const { castLock, variants, busy, progressLabel } = useApp();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-panel/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-accent grid place-items-center text-black font-black text-sm">C</div>
            <div>
              <div className="text-sm font-semibold leading-none">Continuity Matrix</div>
              <div className="text-[10px] text-ink3 leading-none mt-1">a Creative Studio power-tool for HexCoded</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-ink3 font-mono">
            <span className="rounded-full border border-line bg-bg px-2 py-0.5">
              cast {castLock ? "locked" : "unlocked"}
            </span>
            <span className="rounded-full border border-line bg-bg px-2 py-0.5">
              {variants.length} variants
            </span>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line bg-panel2 hover:bg-line px-2.5 py-1 text-ink2"
            >
              repo
            </a>
          </div>
        </div>
        {progressLabel && (
          <div
            className={`border-t border-line text-[12px] font-mono px-6 py-2 ${
              progressLabel.startsWith("✗")
                ? "bg-bad/10 text-bad"
                : progressLabel.startsWith("✓")
                ? "bg-ok/10 text-ok"
                : "bg-accent/5 text-accent2"
            }`}
          >
            <div className="max-w-[1600px] mx-auto flex items-center gap-2">
              {busy && (
                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
              <span className="truncate">{progressLabel}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-3 border-r border-line pr-4">
          <CastLockPane />
        </section>
        <section className="col-span-12 lg:col-span-3 border-r border-line pr-4">
          <MatrixBuilderPane />
        </section>
        <section className="col-span-12 lg:col-span-6">
          <VariantGridPane />
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-[1600px] mx-auto px-6 py-3 text-[11px] text-ink3 flex items-center justify-between">
          <div>
            Built for <span className="text-ink">HexCoded</span> · sits next to Creative Studio · drops in as a node
          </div>
          <div className="font-mono">
            lib/cast-lock · lib/orchestrator · lib/compositor · lib/scoring
          </div>
        </div>
      </footer>
    </div>
  );
}

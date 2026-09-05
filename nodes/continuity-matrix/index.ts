import type { RenderPlan, CastLock } from "../../src/lib/types";
import { buildRenderPlan } from "../../src/lib/orchestrator/orchestrator";
import { scoreHook } from "../../src/lib/scoring/hook-scoring";
import { fitScoreFor } from "../../src/lib/scoring/fit-score";

export interface NodeInput {
  castLock: CastLock;
  hooks: string[];
  angles: RenderPlan["angle"][];
  pacing: RenderPlan["pacing"][];
  formats: RenderPlan["format"][];
  maxVariants: number;
}

export interface NodeOutput {
  variants: Array<RenderPlan & { hookScore: number; fitScore: number; compositeScore: number }>;
}

export const NODE_ID = "continuity-matrix";
export const NODE_VERSION = "0.1.0";

export function run(input: NodeInput): NodeOutput {
  const out: NodeOutput["variants"] = [];
  outer: for (const hook of input.hooks) {
    for (const angle of input.angles) {
      for (const pacing of input.pacing) {
        for (const format of input.formats) {
          const plan = buildRenderPlan(
            input.castLock,
            { id: `h_${hook}`, text: hook, source: "library" },
            angle,
            pacing,
            format
          );
          const hs = scoreHook(hook, angle);
          const fit = fitScoreFor(angle, pacing, format);
          out.push({
            ...plan,
            hookScore: hs.total,
            fitScore: fit,
            compositeScore: Math.round(hs.total * 0.6 + fit * 0.4),
          });
          if (out.length >= input.maxVariants) break outer;
        }
      }
    }
  }
  return { variants: out };
}

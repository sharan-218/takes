import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

interface LiveRequest {
  prompt: string;
  model?: string;
  durationSeconds?: number;
  aspect?: "9:16" | "1:1" | "16:9";
  castLockId?: string;
  firstFrameImage?: string;
}

const REPLICATE_BASE = "https://api.replicate.com/v1";

function pickDefaultModel(): string {
  return process.env.REPLICATE_DEFAULT_MODEL ?? "minimax/video-01";
}

async function submitPrediction(
  token: string,
  model: string,
  body: Record<string, unknown>
) {
  const res = await fetch(`${REPLICATE_BASE}/models/${model}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ input: body }),
  });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false as const, status: res.status, json };
  }
  return { ok: true as const, json };
}

async function pollPrediction(token: string, id: string, maxWaitMs = 240_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${REPLICATE_BASE}/predictions/${id}`, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false as const, status: res.status, json };
    }
    if (json.status === "succeeded") {
      return { ok: true as const, json };
    }
    if (json.status === "failed" || json.status === "canceled") {
      return { ok: false as const, status: 502, json };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return { ok: false as const, status: 504, json: { error: "timeout" } };
}

function extractVideoUrl(json: unknown): string | null {
  const out = (json as { output?: unknown })?.output;
  if (!out) return null;
  if (typeof out === "string") return out;
  if (Array.isArray(out) && out.length > 0) {
    const last = out[out.length - 1];
    if (typeof last === "string") return last;
    if (last && typeof last === "object" && "url" in last) {
      return String((last as { url: unknown }).url);
    }
  }
  if (out && typeof out === "object" && "url" in out) {
    return String((out as { url: unknown }).url);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as LiveRequest;
  if (!body?.prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error: "live mode not configured",
        message:
          "Set REPLICATE_API_TOKEN in .env.local to enable live generation. The demo ships with library-backed renders; this route is the seam.",
        requestEcho: body,
      },
      { status: 501 }
    );
  }
  const model = body.model ?? pickDefaultModel();
  const input: Record<string, unknown> = {
    prompt: body.prompt,
    prompt_optimizer: true,
  };
  if (body.firstFrameImage) {
    input.first_frame_image = body.firstFrameImage;
  }
  const submit = await submitPrediction(token, model, input);
  if (!submit.ok) {
    return NextResponse.json(
      { error: "submit failed", providerResponse: submit.json },
      { status: submit.status }
    );
  }
  if (submit.json.status === "succeeded") {
    const url = extractVideoUrl(submit.json);
    return NextResponse.json({
      predictionId: submit.json.id,
      status: "succeeded",
      videoUrl: url,
      model,
      castLockId: body.castLockId,
    });
  }
  const polled = await pollPrediction(token, submit.json.id);
  if (!polled.ok) {
    return NextResponse.json(
      { error: "prediction failed", providerResponse: polled.json },
      { status: polled.status }
    );
  }
  const url = extractVideoUrl(polled.json);
  return NextResponse.json({
    predictionId: submit.json.id,
    status: "succeeded",
    videoUrl: url,
    model,
    castLockId: body.castLockId,
  });
}

export async function GET() {
  const token = process.env.REPLICATE_API_TOKEN;
  return NextResponse.json({
    liveModeEnabled: Boolean(token),
    defaultModel: pickDefaultModel(),
  });
}

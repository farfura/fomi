import { NextResponse } from "next/server";
import {
  createGeneration,
  listGenerations,
  PAGE_SIZE,
  validateGenerationInput,
} from "@/server/services/generations";
import { getModel } from "@/server/services/catalog";
import { jsonError, randomBetween, sleep } from "@/server/utils";

/** GET /api/generations?cursor=<id>&limit=<n>&type=image|video */
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || PAGE_SIZE, 1), 50);
  const type = ["image", "video"].includes(params.get("type")) ? params.get("type") : "all";

  // Simulated network latency so loading states are visible.
  await sleep(randomBetween(250, 600), request.signal);
  return NextResponse.json(listGenerations({ cursor: params.get("cursor"), limit, type }));
}

/** POST /api/generations: runs the mock model and returns a finished generation. */
export async function POST(request) {
  const input = await request.json().catch(() => null);
  const problem = validateGenerationInput(input);
  if (problem) return jsonError(422, "invalid_request", problem);

  // Include "#fail" in a prompt to exercise the error state in the UI.
  if (input.prompt.includes("#fail")) {
    await sleep(900, request.signal);
    return jsonError(503, "model_busy", "The model is busy right now. Please try again in a moment.");
  }

  // Latency scales a little with the model and the number of outputs.
  const model = getModel(input.modelId);
  const base = input.mode === "video" ? 3200 : 1500;
  await sleep(base + model.eta * 40 + input.count * 180 + randomBetween(0, 500), request.signal);

  return NextResponse.json({ generation: createGeneration(input) }, { status: 201 });
}

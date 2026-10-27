import { NextResponse } from "next/server";
import { createTakes, getProject, validateTakesInput } from "@/server/services/studio";
import { jsonError, randomBetween, sleep } from "@/server/utils";

/**
 * POST /api/studio/projects/:projectId/takes
 * Body: { shotId, parentId, direction, notes, strength, count, exclude }
 * `exclude` lists media already used in the shot, parent first.
 */
export async function POST(request, { params }) {
  const { projectId } = await params;
  if (!getProject(projectId)) return jsonError(404, "not_found", "Project not found.");

  const input = await request.json().catch(() => null);
  const problem = validateTakesInput(input);
  if (problem) return jsonError(422, "invalid_request", problem);

  await sleep(1400 + input.count * 350 + randomBetween(0, 500), request.signal);
  return NextResponse.json({ takes: createTakes(input) }, { status: 201 });
}

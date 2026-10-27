import { NextResponse } from "next/server";
import { getProject } from "@/server/services/studio";
import { jsonError } from "@/server/utils";

/** GET /api/studio/projects/:projectId */
export async function GET(_request, { params }) {
  const { projectId } = await params;
  const project = getProject(projectId);
  if (!project) return jsonError(404, "not_found", "Project not found.");
  return NextResponse.json({ project });
}

import { NextResponse } from "next/server";
import { getCatalog } from "@/server/services/catalog";

/** GET /api/catalog: models, aspect ratios, output counts and style presets. */
export async function GET() {
  return NextResponse.json(getCatalog());
}

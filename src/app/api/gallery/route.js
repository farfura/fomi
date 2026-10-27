import { NextResponse } from "next/server";
import { listGallery } from "@/server/services/gallery";
import { randomBetween, sleep } from "@/server/utils";

/** GET /api/gallery: curated community creations for inspiration. */
export async function GET(request) {
  await sleep(randomBetween(300, 700), request.signal);
  return NextResponse.json({ items: listGallery() });
}

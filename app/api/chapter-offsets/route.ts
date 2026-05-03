import { NextResponse } from "next/server";
import { getChapterOffsets } from "@/lib/pageOffsets";

export async function GET() {
  const offsets = await getChapterOffsets();
  return NextResponse.json(offsets, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}

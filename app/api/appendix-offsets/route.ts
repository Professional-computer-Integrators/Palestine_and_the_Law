import { NextResponse } from "next/server";
import { getAppendixOffsets } from "@/lib/appendixOffsets";

export async function GET() {
  const offsets = await getAppendixOffsets();
  return NextResponse.json(offsets, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}

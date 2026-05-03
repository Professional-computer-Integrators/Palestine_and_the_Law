import { NextRequest, NextResponse } from "next/server";
import { CHAPTERS } from "@/lib/chapters";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const numParam = searchParams.get("num");
  const num = numParam ? parseInt(numParam, 10) : 1; // backwards compat

  const ch = CHAPTERS.find((c) => c.num === num);
  if (!ch) {
    return NextResponse.json(
      { error: `Unknown chapter: ${numParam}` },
      { status: 404 }
    );
  }

  try {
    const res = await fetch(ch.docUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PalestineAndTheLaw/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch document: ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Allow the client to cache for 5 min so repeated visits are instant
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

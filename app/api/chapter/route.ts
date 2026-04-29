import { NextRequest, NextResponse } from "next/server";

const DOC_PUB_URL =
  "https://docs.google.com/document/d/e/2PACX-1vQFZZPPadgq_hkxCF_UM1wNVgAf0c8GfF346h_wUnmgU3D6noIRI9mZ62j8EPsjqwAY5BSK6LHFbA6L/pub";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(DOC_PUB_URL, {
      // Never cache so we always reflect the latest version of the doc
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PalestineAndTheLaw/1.0)",
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
        // Allow the client to cache for 60 s so repeated flips are instant
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

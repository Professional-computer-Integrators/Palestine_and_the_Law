import { archiveOlderThanMonths } from "@/lib/admin/sessionStore";

export const runtime = "nodejs";

type ArchiveRequest = {
  months?: number;
};

export async function POST(request: Request) {
  let body: ArchiveRequest = {};

  try {
    body = (await request.json()) as ArchiveRequest;
  } catch {
    body = {};
  }

  const months =
    Number.isFinite(body.months) && (body.months ?? 0) > 0 ? Number(body.months) : 12;

  const { archivedRows, remainingRows, xlsBuffer } = await archiveOlderThanMonths(months);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `archived-sessions-${months}m-${stamp}.xls`;

  return new Response(xlsBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.ms-excel",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Archived-Count": String(archivedRows.length),
      "X-Remaining-Count": String(remainingRows.length),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Long-lived cache headers since blob ids are content-addressed (a new upload
// gets a new id), so the URL itself is the cache key.
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const blob = await prisma.imageBlob.findUnique({
    where: { id },
    select: { data: true, mimeType: true, size: true, createdAt: true },
  });

  if (!blob) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // PrismaPg returns Bytes as a Uint8Array. Wrap it in a fresh Buffer so the
  // Response body type is unambiguous.
  const body = Buffer.from(blob.data);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": blob.mimeType,
      "Content-Length": String(blob.size),
      "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
      "Last-Modified": blob.createdAt.toUTCString(),
    },
  });
}

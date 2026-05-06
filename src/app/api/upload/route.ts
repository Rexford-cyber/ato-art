import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 8 MB per file. Postgres `bytea` can hold a lot more, but the rendering
// pipeline gets sluggish above this and we want the artist to know up front.
const MAX_BYTES = 8 * 1024 * 1024;

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ARTIST" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Field 'file' missing" }, { status: 400 });
  }
  if (!ACCEPTED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WebP, AVIF, or GIF." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large. Max ${MAX_BYTES / (1024 * 1024)} MB.` },
      { status: 413 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = await prisma.imageBlob.create({
    data: {
      data: buffer,
      mimeType: file.type,
      size: file.size,
    },
    select: { id: true, mimeType: true, size: true },
  });

  // Mirror the shape the existing ArtworkImage validation expects.
  // We don't decode dimensions on the server (no sharp dep needed), so
  // width/height are 0 and the format comes from the mime subtype.
  const format = blob.mimeType.split("/")[1] ?? "bin";
  return NextResponse.json({
    url: `/api/images/${blob.id}`,
    publicId: blob.id,
    width: 0,
    height: 0,
    format,
    bytes: blob.size,
  });
}

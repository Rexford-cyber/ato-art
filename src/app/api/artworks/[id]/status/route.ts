import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { artworkStatusSchema } from "@/lib/validations/artwork";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = artworkStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { status, moderationNote } = parsed.data;

  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.artwork.update({
    where: { id },
    data: {
      status,
      moderationNote: moderationNote ?? null,
      moderatedBy: session.user.id,
      moderatedAt: new Date(),
    },
    include: {
      artist: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

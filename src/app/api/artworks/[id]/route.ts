import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tags: true,
      artist: {
        select: {
          id: true, name: true, username: true, avatarUrl: true,
          artistProfile: { select: { displayName: true, tagline: true } },
        },
      },
      category: true,
    },
  });

  if (!artwork) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = session?.user?.id === artwork.artistId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (artwork.status !== "APPROVED" && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(artwork);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = session.user.id === artwork.artistId;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (artwork.status === "PENDING" || artwork.status === "APPROVED") {
    return NextResponse.json(
      { error: "Cannot edit artwork while PENDING or APPROVED. Archive it first." },
      { status: 409 }
    );
  }

  const body = await req.json();
  const submit = body.submit === true;
  delete body.submit;

  const updated = await prisma.artwork.update({
    where: { id },
    data: {
      ...body,
      ...(submit ? { status: "PENDING", submittedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!artwork) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.id !== artwork.artistId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.artwork.update({ where: { id }, data: { status: "ARCHIVED" } });

  return NextResponse.json({ success: true });
}

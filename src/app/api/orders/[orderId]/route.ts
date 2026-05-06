import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      buyer: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = order.buyerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isArtist =
    session.user.role === "ARTIST" &&
    order.items.some((i) => i.artistId === session.user.id);

  if (!isOwner && !isAdmin && !isArtist) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isArtistOwner =
    session.user.role === "ARTIST" &&
    order.items.some((i) => i.artistId === session.user.id);

  if (!isAdmin && !isArtistOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["status", "trackingNumber"];
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (data.status === "SHIPPED") data.shippedAt = new Date();
  if (data.status === "DELIVERED") data.deliveredAt = new Date();

  const updated = await prisma.order.update({ where: { id: orderId }, data });
  return NextResponse.json(updated);
}

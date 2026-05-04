import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { calculateCommission } from "@/constants/commission";

function generateOrderNumber() {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${datePart}-${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { items, ...shipping } = parsed.data;

  const artworkIds = items.map((i) => i.artworkId);
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: artworkIds }, status: "APPROVED" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      artist: { select: { id: true, name: true } },
    },
  });

  if (artworks.length !== artworkIds.length) {
    return NextResponse.json({ error: "One or more artworks are unavailable" }, { status: 400 });
  }

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const art = artworks.find((a) => a.id === item.artworkId)!;
    const unitPrice = Number(art.price);
    const itemSubtotal = unitPrice * item.quantity;
    const { platformFee, artistEarnings } = calculateCommission(itemSubtotal);
    subtotal += itemSubtotal;
    return {
      artworkId: art.id,
      artworkTitle: art.title,
      artworkImageUrl: art.images[0]?.url ?? "",
      artistId: art.artist.id,
      artistName: art.artist.name,
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal,
      platformFee,
      artistEarnings,
    };
  });

  const total = subtotal;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      buyerId: session.user.id,
      subtotal,
      shippingFee: 0,
      total,
      currency: artworks[0].currency,
      ...shipping,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      },
    },
  });

  return NextResponse.json(orders);
}

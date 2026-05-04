import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { toKobo } from "@/lib/utils/currency";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order cannot be paid in its current state" }, { status: 409 });
  }

  const serverTotal = order.items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );
  if (Math.abs(serverTotal - Number(order.total)) > 0.01) {
    return NextResponse.json({ error: "Order total mismatch" }, { status: 409 });
  }

  const reference = `ATO-${order.id}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const result = await initializeTransaction({
    email: session.user.email,
    amount: toKobo(serverTotal),
    reference,
    currency: order.currency,
    callback_url: `${appUrl}/checkout/success?reference=${reference}`,
    metadata: {
      orderId: order.id,
      buyerId: session.user.id,
      orderNumber: order.orderNumber,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentReference: reference, status: "PROCESSING", paymentProvider: "paystack" },
  });

  return NextResponse.json({
    authorizationUrl: result.authorization_url,
    accessCode: result.access_code,
    reference,
  });
}

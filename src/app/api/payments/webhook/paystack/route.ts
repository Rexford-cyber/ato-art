import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY!;

  const expectedSig = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);
  const isValid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference: string = event.data.reference;

    const order = await prisma.order.findUnique({
      where: { paymentReference: reference },
      include: { items: { include: { artwork: true } } },
    });

    if (!order) return NextResponse.json({ received: true });
    if (order.status === "PAID") return NextResponse.json({ received: true });

    const webhookAmount = event.data.amount;
    const expectedAmount = Math.round(Number(order.total) * 100);
    if (Math.abs(webhookAmount - expectedAmount) > 1) {
      console.error(`Amount mismatch on order ${order.id}: expected ${expectedAmount}, got ${webhookAmount}`);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentChannel: event.data.channel,
        },
      });

      for (const item of order.items) {
        if (item.artwork.isOriginal) {
          await tx.artwork.update({
            where: { id: item.artworkId },
            data: { status: "SOLD", stockCount: 0 },
          });
        } else {
          await tx.artwork.update({
            where: { id: item.artworkId },
            data: { stockCount: { decrement: item.quantity } },
          });
        }

        const artistProfile = await tx.artistProfile.findUnique({
          where: { userId: item.artistId },
        });
        if (artistProfile) {
          await tx.artistProfile.update({
            where: { id: artistProfile.id },
            data: {
              totalSales: { increment: item.quantity },
              totalRevenue: { increment: Number(item.subtotal) },
              totalEarnings: { increment: Number(item.artistEarnings) },
            },
          });
        }
      }
    });
  }

  return NextResponse.json({ received: true });
}

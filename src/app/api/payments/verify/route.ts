import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { paymentReference: reference },
    include: { items: true },
  });

  if (!order || order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ status: "success", order });
  }

  try {
    const result = await verifyTransaction(reference);
    return NextResponse.json({ status: result.status, order });
  } catch {
    return NextResponse.json({ status: "pending", order });
  }
}

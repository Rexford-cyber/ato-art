import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Details" };

interface PageProps { params: Promise<{ orderId: string }> }

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
    },
  });

  if (!order || order.buyerId !== session!.user.id) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          {order.status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Placed on {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
      </p>

      {/* Items */}
      <div className="rounded-xl border overflow-hidden divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.artwork.images[0] && (
                <Image
                  src={item.artwork.images[0].url}
                  alt={item.artworkTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/artworks/${item.artwork.slug}`}
                className="font-medium hover:underline"
              >
                {item.artworkTitle}
              </Link>
              <p className="text-sm text-muted-foreground">by {item.artistName}</p>
            </div>
            <span className="font-semibold">{formatCurrency(item.subtotal, order.currency)}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{Number(order.shippingFee) === 0 ? "Free" : formatCurrency(order.shippingFee, order.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t pt-2 mt-1">
          <span>Total</span>
          <span>{formatCurrency(order.total, order.currency)}</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="rounded-xl border p-4 space-y-1 text-sm">
        <p className="font-semibold mb-2">Shipping Address</p>
        <p>{order.shippingName}</p>
        <p>{order.shippingAddress}</p>
        <p>{order.shippingCity}, {order.shippingCountry}</p>
        {order.shippingPhone && <p>{order.shippingPhone}</p>}
      </div>

      {order.trackingNumber && (
        <div className="rounded-xl border p-4 text-sm">
          <p className="font-semibold">Tracking Number</p>
          <p className="mt-1 font-mono">{order.trackingNumber}</p>
        </div>
      )}
    </div>
  );
}

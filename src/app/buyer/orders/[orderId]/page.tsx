import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Details" };

interface PageProps { params: Promise<{ orderId: string }> }

const statusStyle: Record<string, string> = {
  PENDING:    "border-ochre/50 text-ochre bg-ochre/8",
  PROCESSING: "border-ochre/50 text-ochre bg-ochre/8",
  PAID:       "border-moss/40 text-moss bg-moss/8",
  SHIPPED:    "border-moss/40 text-moss bg-moss/8",
  DELIVERED:  "border-moss/40 text-moss bg-moss/8",
  CANCELLED:  "border-brick/40 text-brick bg-brick/8",
  REFUNDED:   "border-border text-ink-soft bg-transparent",
};

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

  if (!session || !order || order.buyerId !== session.user.id) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/buyer/orders"
          className="mb-4 inline-flex items-center text-[12.5px] text-ink-muted transition-colors hover:text-ink"
        >
          ← My orders
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
              Order
            </p>
            <h1 className="font-display mt-1.5 text-[clamp(1.6rem,3vw,2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
              {order.orderNumber}
            </h1>
          </div>
          <span
            className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] ${statusStyle[order.status] ?? "border-border text-ink-soft"}`}
          >
            {order.status.toLowerCase()}
          </span>
        </div>
        <p className="mt-2 text-[13px] text-ink-muted">
          Placed {format(order.createdAt, "d MMMM yyyy 'at' h:mm a")}
        </p>
      </div>

      {/* Items */}
      <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
              {item.artwork.images[0] && (
                <Image
                  src={item.artwork.images[0].url}
                  alt={item.artworkTitle}
                  fill
                  unoptimized={item.artwork.images[0].url.startsWith("http")}
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/artworks/${item.artwork.slug}`}
                className="group inline-flex items-center gap-1 font-display text-[14.5px] font-medium text-ink transition-colors hover:text-accent"
              >
                {item.artworkTitle}
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" strokeWidth={1.6} />
              </Link>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">by {item.artistName}</p>
            </div>
            <span className="shrink-0 font-mono text-[13px] tabular-nums text-ink">
              {formatCurrency(item.subtotal, order.currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="rounded-md border border-border bg-surface p-5 space-y-3 text-[13.5px]">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums text-ink">{formatCurrency(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>Shipping</span>
          <span className="font-mono tabular-nums text-ink">
            {Number(order.shippingFee) === 0 ? "Free" : formatCurrency(order.shippingFee, order.currency)}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          <span className="font-medium text-ink">Total</span>
          <span className="font-mono text-[15px] tabular-nums text-ink">
            {formatCurrency(order.total, order.currency)}
          </span>
        </div>
      </div>

      {/* Shipping address */}
      <div className="rounded-md border border-border bg-surface p-5 text-[13.5px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft mb-3">
          Shipping address
        </p>
        <p className="text-ink">{order.shippingName}</p>
        <p className="text-ink-muted">{order.shippingAddress}</p>
        <p className="text-ink-muted">{order.shippingCity}, {order.shippingCountry}</p>
        {order.shippingPhone && (
          <p className="mt-1 font-mono text-[12.5px] text-ink-muted">{order.shippingPhone}</p>
        )}
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="rounded-md border border-border bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft mb-2">
            Tracking number
          </p>
          <p className="font-mono text-[14px] text-ink">{order.trackingNumber}</p>
        </div>
      )}
    </div>
  );
}

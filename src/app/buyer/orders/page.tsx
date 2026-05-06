import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Orders" };

const statusStyle: Record<string, string> = {
  PENDING:    "border-ochre/50 text-ochre bg-ochre/8",
  PROCESSING: "border-ochre/50 text-ochre bg-ochre/8",
  PAID:       "border-moss/40 text-moss bg-moss/8",
  SHIPPED:    "border-moss/40 text-moss bg-moss/8",
  DELIVERED:  "border-moss/40 text-moss bg-moss/8",
  CANCELLED:  "border-brick/40 text-brick bg-brick/8",
  REFUNDED:   "border-border text-ink-soft bg-transparent",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending", PROCESSING: "Processing", PAID: "Paid",
  SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled", REFUNDED: "Refunded",
};

export default async function BuyerOrdersPage() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 4,
        include: {
          artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">Account</p>
        <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          My orders
        </h1>
        <p className="mt-1.5 font-mono text-[12px] tabular-nums text-ink-soft">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <p className="font-display text-[18px] font-semibold text-ink">No orders yet.</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">Browse the collection and buy your first piece.</p>
          <Link href="/artworks" className="mt-5 inline-flex items-center gap-1 text-[13.5px] text-ink underline underline-offset-[3px] decoration-1 decoration-ink-soft transition-colors hover:decoration-accent">
            Browse art
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/buyer/orders/${order.id}`}
                className="group block rounded-md border border-border bg-surface p-5 transition-colors duration-[180ms] hover:border-ink-soft/40 hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[12.5px] tabular-nums text-ink">{order.orderNumber}</span>
                    <span className="text-[12px] text-ink-soft">{format(order.createdAt, "d MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] tabular-nums text-ink">
                      {formatCurrency(Number(order.total), order.currency ?? "GHS")}
                    </span>
                    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${statusStyle[order.status] ?? "border-border text-ink-soft"}`}>
                      {statusLabel[order.status] ?? order.status.toLowerCase()}
                    </span>
                  </div>
                </div>
                {order.items.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {order.items.map((item) =>
                      item.artwork.images[0] ? (
                        <div key={item.id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                          <Image
                            src={item.artwork.images[0].url}
                            alt={item.artworkTitle}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

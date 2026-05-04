import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Orders" };

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-200 text-green-900",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default async function BuyerOrdersPage() {
  const session = await auth();

  const orders = await prisma.order.findMany({
    where: { buyerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 3,
        include: { artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-muted-foreground">Start browsing and buy your first piece of art</p>
          <Link href="/artworks" className="mt-4 text-sm underline underline-offset-4">Browse Art</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/buyer/orders/${order.id}`}
              className="block rounded-xl border p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                  <span className="ml-3 text-xs text-muted-foreground">
                    {format(order.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[order.status] ?? ""}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold">{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
                    {item.artwork.images[0] && (
                      <Image
                        src={item.artwork.images[0].url}
                        alt={item.artworkTitle}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                ))}
                {order.items.length === 3 && (
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    +more
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

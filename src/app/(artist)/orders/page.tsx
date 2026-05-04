import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import UpdateOrderStatus from "@/components/artist/UpdateOrderStatus";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Sales" };

export default async function ArtistOrdersPage() {
  const session = await auth();

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      items: { some: { artistId: session!.user.id } },
    },
    orderBy: { paidAt: "desc" },
    include: {
      items: { where: { artistId: session!.user.id } },
      buyer: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales ({orders.length})</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No sales yet. Once buyers purchase your approved artwork, sales will appear here.
        </p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Buyer</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium">Earnings</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const earnings = order.items.reduce(
                  (s, i) => s + Number(i.artistEarnings),
                  0
                );
                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {order.buyer.name}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                      {order.paidAt ? format(order.paidAt, "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(earnings, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "PAID" && (
                        <UpdateOrderStatus orderId={order.id} nextStatus="SHIPPED" label="Mark Shipped" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

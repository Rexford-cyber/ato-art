import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import UpdateOrderStatus from "@/components/artist/UpdateOrderStatus";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Sales" };

const statusStyle: Record<string, string> = {
  PAID:      "border-moss/40 text-moss bg-moss/8",
  SHIPPED:   "border-moss/40 text-moss bg-moss/8",
  DELIVERED: "border-moss/40 text-moss bg-moss/8",
};

export default async function ArtistOrdersPage() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      items: { some: { artistId: session.user.id } },
    },
    orderBy: { paidAt: "desc" },
    include: {
      items: { where: { artistId: session.user.id } },
      buyer: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
          Revenue
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Sales
        </h1>
        <p className="mt-1.5 font-mono text-[12px] tabular-nums text-ink-soft">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-16 text-center">
          <p className="font-display text-[17px] font-semibold text-ink">
            No sales yet.
          </p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            Once buyers purchase your approved artwork, sales appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-md border border-border sm:block">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Order
                  </th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft md:table-cell">
                    Buyer
                  </th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Earnings
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const earnings = order.items.reduce(
                    (s, i) => s + Number(i.artistEarnings),
                    0
                  );
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5 font-mono text-[11.5px] tabular-nums text-ink-soft">
                        {order.orderNumber}
                      </td>
                      <td className="hidden px-4 py-3.5 text-ink-muted md:table-cell">
                        {order.buyer.name}
                      </td>
                      <td className="hidden px-4 py-3.5 text-[12px] text-ink-muted lg:table-cell">
                        {order.paidAt ? format(order.paidAt, "d MMM yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-ink">
                        {formatCurrency(earnings, order.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${statusStyle[order.status] ?? "border-border text-ink-soft"}`}
                        >
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {order.status === "PAID" && (
                          <UpdateOrderStatus
                            orderId={order.id}
                            nextStatus="SHIPPED"
                            label="Mark shipped"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="space-y-3 sm:hidden">
            {orders.map((order) => {
              const earnings = order.items.reduce(
                (s, i) => s + Number(i.artistEarnings),
                0
              );
              return (
                <li
                  key={order.id}
                  className="rounded-md border border-border bg-surface p-4"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[11.5px] tabular-nums text-ink-soft">
                      {order.orderNumber}
                    </span>
                    <span className="font-mono text-[14px] tabular-nums text-ink">
                      {formatCurrency(earnings, order.currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink">{order.buyer.name}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${statusStyle[order.status] ?? "border-border text-ink-soft"}`}
                      >
                        {order.status.toLowerCase()}
                      </span>
                      {order.paidAt && (
                        <span className="text-[11.5px] text-ink-soft">
                          {format(order.paidAt, "d MMM yyyy")}
                        </span>
                      )}
                    </div>
                    {order.status === "PAID" && (
                      <UpdateOrderStatus
                        orderId={order.id}
                        nextStatus="SHIPPED"
                        label="Mark shipped"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artist Dashboard" };

export default async function ArtistDashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [artworkCounts, profile, recentOrders] = await Promise.all([
    prisma.artwork.groupBy({
      by: ["status"],
      where: { artistId: session.user.id },
      _count: true,
    }),
    prisma.artistProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        items: { some: { artistId: session.user.id } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: { where: { artistId: session.user.id } },
        buyer: { select: { name: true } },
      },
    }),
  ]);

  const counts = Object.fromEntries(artworkCounts.map((r) => [r.status, r._count]));
  const firstName = session?.user?.name?.split(" ")[0] ?? "Artist";

  return (
    <div className="max-w-3xl space-y-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            Welcome back
          </p>
          <h1 className="font-display mt-2 text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
            {firstName}.
          </h1>
        </div>
        <Button asChild className="mt-1 shrink-0 gap-1.5">
          <Link href="/artist/artworks/upload">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Upload artwork
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Approved works" value={String(counts.APPROVED ?? 0)} sub={`${counts.PENDING ?? 0} pending review`} />
        <StatCard label="Pieces sold" value={String(profile?.totalSales ?? 0)} sub="all time" />
        <StatCard label="Earnings" value={formatCurrency(Number(profile?.totalEarnings ?? 0), "GHS")} sub="after 15% fee" mono />
      </div>

      {(counts.PENDING ?? 0) > 0 && (
        <div className="rounded-md border border-ochre/40 bg-ochre/8 px-5 py-4">
          <p className="text-[13.5px] text-ink">
            <span className="font-medium">{counts.PENDING} {counts.PENDING === 1 ? "artwork" : "artworks"}</span>
            {" "}pending admin review.{" "}
            <Link href="/artist/artworks" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
              View your artworks
            </Link>
          </p>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">Recent sales</p>
          {recentOrders.length > 0 && (
            <Link href="/artist/orders" className="group inline-flex items-center gap-1 text-[12.5px] text-ink-muted transition-colors hover:text-ink">
              All orders
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.6} />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-5 rounded-md border border-border bg-surface px-6 py-10 text-center">
            <p className="font-display text-[16px] font-medium text-ink">No sales yet.</p>
            <p className="mt-1.5 text-[13.5px] text-ink-muted">Upload work and get it approved to start selling.</p>
            <Button asChild variant="ghost" className="mt-4 gap-1">
              <Link href="/artist/artworks/upload">
                Upload your first piece
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">Order</th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft md:table-cell">Buyer</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-ink">{order.orderNumber}</td>
                    <td className="hidden px-4 py-3 text-ink-muted md:table-cell">{order.buyer.name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                      {formatCurrency(order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0), "GHS")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, mono = false }: { label: string; value: string; sub: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className={`mt-3 text-[26px] font-semibold leading-none text-ink ${mono ? "font-mono tabular-nums" : "font-display"}`}>{value}</p>
      <p className="mt-1.5 text-[12px] text-ink-soft">{sub}</p>
    </div>
  );
}

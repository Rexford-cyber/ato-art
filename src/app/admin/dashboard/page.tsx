import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [pendingCount, artistCount, totalOrders, revenue] = await Promise.all([
    prisma.artwork.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "ARTIST" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

  const gmv = Number(revenue._sum.total ?? 0);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
          Overview
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Admin dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminStat
          label="Pending review"
          value={String(pendingCount)}
          urgent={pendingCount > 0}
        />
        <AdminStat label="Artists" value={String(artistCount)} />
        <AdminStat label="Orders" value={String(totalOrders)} />
        <AdminStat
          label="Platform GMV"
          value={formatCurrency(gmv, "GHS")}
          mono
        />
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-6 rounded-md border border-ochre/50 bg-ochre/8 px-5 py-4">
          <div>
            <p className="text-[14px] font-medium text-ink">
              {pendingCount} artwork{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Artists are waiting — review their submissions to get them live.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-1">
            <Link href="/admin/artworks?status=PENDING">
              Go to queue
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </Button>
        </div>
      )}

      {/* Quick links */}
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
          Quick actions
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickLink href="/admin/artworks" label="Moderation queue" />
          <QuickLink href="/admin/artists" label="All artists" />
        </div>
      </div>
    </div>
  );
}

function AdminStat({
  label,
  value,
  urgent = false,
  mono = false,
}: {
  label: string;
  value: string;
  urgent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={`rounded-md border p-5 ${urgent ? "border-ochre/50 bg-ochre/8" : "border-border bg-surface"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p
        className={`mt-3 text-[24px] font-semibold leading-none ${mono ? "font-mono tabular-nums text-ink" : "font-display text-ink"} ${urgent ? "text-ochre" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 transition-colors duration-[180ms] hover:border-ink-soft/40 hover:bg-muted/40"
    >
      <span className="text-[13.5px] text-ink">{label}</span>
      <ArrowUpRight
        className="h-4 w-4 text-ink-soft transition-transform duration-[240ms] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
        strokeWidth={1.6}
      />
    </Link>
  );
}

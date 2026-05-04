import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, ImageIcon, ShoppingBag, AlertCircle } from "lucide-react";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCount}</p>
            <Button asChild size="sm" className="mt-2" variant={pendingCount > 0 ? "default" : "outline"}>
              <Link href="/admin/artworks?status=PENDING">Review Queue</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{artistCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Platform GMV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(gmv, "GHS")}</p>
          </CardContent>
        </Card>
      </div>

      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900">
              {pendingCount} artwork{pendingCount !== 1 ? "s" : ""} waiting for review
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Artists are waiting — review their submissions to get them live.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/artworks?status=PENDING">Go to Queue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

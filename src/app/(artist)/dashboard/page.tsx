import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Image as ImageIcon, ShoppingBag, TrendingUp, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artist Dashboard" };

export default async function ArtistDashboardPage() {
  const session = await auth();

  const [artworkCounts, profile, recentOrders] = await Promise.all([
    prisma.artwork.groupBy({
      by: ["status"],
      where: { artistId: session!.user.id },
      _count: true,
    }),
    prisma.artistProfile.findUnique({ where: { userId: session!.user.id } }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        items: { some: { artistId: session!.user.id } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: { where: { artistId: session!.user.id } },
        buyer: { select: { name: true } },
      },
    }),
  ]);

  const counts = Object.fromEntries(artworkCounts.map((r) => [r.status, r._count]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/artist/artworks/upload" className="gap-2">
            <Plus className="h-4 w-4" /> Upload Artwork
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Artworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.APPROVED ?? 0}</p>
            <p className="text-xs text-muted-foreground">{counts.PENDING ?? 0} pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile?.totalSales ?? 0}</p>
            <p className="text-xs text-muted-foreground">pieces sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(profile?.totalEarnings ?? 0), "GHS")}
            </p>
            <p className="text-xs text-muted-foreground">after 15% platform fee</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Sales</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet. Upload and get your artwork approved to start selling.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order</th>
                  <th className="px-4 py-3 text-left font-medium">Buyer</th>
                  <th className="px-4 py-3 text-right font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => {
                  const earnings = order.items.reduce((s, i) => s + Number(i.artistEarnings), 0);
                  return (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3">{order.buyer.name}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(earnings, order.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

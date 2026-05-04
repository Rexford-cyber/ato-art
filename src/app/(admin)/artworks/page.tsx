import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import ArtworkStatusBadge from "@/components/artworks/ArtworkStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderation Queue" };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArtworksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status ?? "PENDING";

  const artworks = await prisma.artwork.findMany({
    where: { status: statusFilter as never },
    orderBy: { submittedAt: "asc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      artist: { select: { name: true, username: true, email: true } },
      category: { select: { name: true } },
    },
  });

  const pendingCount = await prisma.artwork.count({ where: { status: "PENDING" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moderation Queue</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-amber-600">{pendingCount}</span> artworks awaiting review
            </p>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["PENDING", "APPROVED", "REJECTED", "ARCHIVED"].map((s) => (
          <Link key={s} href={`/admin/artworks?status=${s}`}>
            <Badge
              variant={statusFilter === s ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
            >
              {s}
            </Badge>
          </Link>
        ))}
      </div>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">No {statusFilter.toLowerCase()} artworks</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Artwork</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Artist</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {artworks.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                        {artwork.images[0] && (
                          <Image src={artwork.images[0].url} alt={artwork.title} fill className="object-cover" sizes="48px" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[140px]">{artwork.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {artwork.artist.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {artwork.category.name}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(artwork.price, artwork.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <ArtworkStatusBadge status={artwork.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/artworks/${artwork.id}/review`}>Review</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

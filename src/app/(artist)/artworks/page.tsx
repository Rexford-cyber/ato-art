import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ArtworkStatusBadge from "@/components/artworks/ArtworkStatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Artworks" };

export default async function ArtistArtworksPage() {
  const session = await auth();

  const artworks = await prisma.artwork.findMany({
    where: { artistId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Artworks ({artworks.length})</h1>
        <Button asChild>
          <Link href="/artist/artworks/upload" className="gap-2">
            <Plus className="h-4 w-4" /> Upload New
          </Link>
        </Button>
      </div>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">No artworks yet</p>
          <p className="mt-1 text-muted-foreground">Upload your first artwork to get started</p>
          <Button asChild className="mt-4">
            <Link href="/artist/artworks/upload">Upload Artwork</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Artwork</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Note</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {artworks.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                        {artwork.images[0] && (
                          <Image
                            src={artwork.images[0].url}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[140px]">{artwork.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {artwork.category.name}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(artwork.price, artwork.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <ArtworkStatusBadge status={artwork.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-destructive max-w-[160px] truncate hidden md:table-cell">
                    {artwork.status === "REJECTED" && artwork.moderationNote}
                  </td>
                  <td className="px-4 py-3">
                    {(artwork.status === "DRAFT" || artwork.status === "REJECTED") && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/artist/artworks/${artwork.id}/edit`}>Edit</Link>
                      </Button>
                    )}
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

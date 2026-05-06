import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ArtworkStatusBadge from "@/components/artworks/ArtworkStatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Artworks" };

export default async function ArtistArtworksPage() {
  const session = await auth();
  if (!session) return null;

  const artworks = await prisma.artwork.findMany({
    where: { artistId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            Portfolio
          </p>
          <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
            My artworks
          </h1>
          <p className="mt-1.5 font-mono text-[12px] tabular-nums text-ink-soft">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <Button asChild className="mt-1 shrink-0 gap-1.5">
          <Link href="/artist/artworks/upload">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Upload new
          </Link>
        </Button>
      </div>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <p className="font-display text-[18px] font-semibold text-ink">
            Nothing uploaded yet.
          </p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            Upload your first artwork to get started.
          </p>
          <Button asChild className="mt-5 gap-1.5">
            <Link href="/artist/artworks/upload">
              Upload artwork
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-md border border-border sm:block">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Artwork
                  </th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft lg:table-cell">
                    Note
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {artworks.map((artwork) => (
                  <tr key={artwork.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-muted">
                          {artwork.images[0] && (
                            <Image
                              src={artwork.images[0].url}
                              alt={artwork.title}
                              fill
                              unoptimized={artwork.images[0].url.startsWith("http")}
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <span className="max-w-[160px] truncate font-medium text-ink">
                          {artwork.title}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-ink-muted md:table-cell">
                      {artwork.category.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono tabular-nums text-ink">
                      {formatCurrency(artwork.price, artwork.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ArtworkStatusBadge status={artwork.status} />
                    </td>
                    <td className="hidden max-w-[160px] truncate px-4 py-3.5 text-[12px] text-brick lg:table-cell">
                      {artwork.status === "REJECTED" && artwork.moderationNote}
                    </td>
                    <td className="px-4 py-3.5">
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

          {/* Mobile card list */}
          <ul className="space-y-3 sm:hidden">
            {artworks.map((artwork) => (
              <li key={artwork.id} className="flex items-center gap-4 rounded-md border border-border bg-surface p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  {artwork.images[0] && (
                    <Image
                      src={artwork.images[0].url}
                      alt={artwork.title}
                      fill
                      unoptimized={artwork.images[0].url.startsWith("http")}
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{artwork.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{artwork.category.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <ArtworkStatusBadge status={artwork.status} />
                    <span className="font-mono text-[11.5px] tabular-nums text-ink-soft">
                      {formatCurrency(artwork.price, artwork.currency)}
                    </span>
                  </div>
                  {artwork.status === "REJECTED" && artwork.moderationNote && (
                    <p className="mt-1 text-[11.5px] text-brick line-clamp-1">
                      {artwork.moderationNote}
                    </p>
                  )}
                </div>
                {(artwork.status === "DRAFT" || artwork.status === "REJECTED") && (
                  <Button variant="ghost" size="sm" asChild className="shrink-0">
                    <Link href={`/artist/artworks/${artwork.id}/edit`}>Edit</Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

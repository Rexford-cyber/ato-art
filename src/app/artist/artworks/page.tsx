import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
  if (!session) redirect("/sign-in");

  const artworks = await prisma.artwork.findMany({
    where: { artistId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
      currency: true,
      moderationNote: true,
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            Portfolio
          </p>
          <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
            My artworks
          </h1>
        </div>
        <Button asChild size="sm" className="shrink-0 mt-1">
          <Link href="/artist/artworks/upload" className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Upload
          </Link>
        </Button>
      </div>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <p className="font-display text-[17px] font-semibold text-ink">No artworks yet</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">Upload your first piece to get started.</p>
          <Button asChild className="mt-5">
            <Link href="/artist/artworks/upload">Upload artwork</Link>
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
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink leading-snug">{artwork.title}</p>
                          {artwork.category && (
                            <p className="text-[12px] text-ink-soft">{artwork.category.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 font-mono tabular-nums text-ink md:table-cell">
                      {formatCurrency(artwork.price, artwork.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ArtworkStatusBadge status={artwork.status} />
                    </td>
                    <td className="hidden px-4 py-3.5 max-w-[180px] lg:table-cell">
                      {artwork.moderationNote ? (
                        <p className="truncate text-[12.5px] text-ink-muted">{artwork.moderationNote}</p>
                      ) : (
                        <span className="text-[12px] text-ink-soft/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/artist/artworks/${artwork.id}/edit`}
                        className="flex items-center justify-end gap-1 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
                      >
                        Edit <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  {artwork.images[0] && (
                    <Image
                      src={artwork.images[0].url}
                      alt={artwork.title}
                      fill
                      unoptimized={artwork.images[0].url.startsWith("http")}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-ink">{artwork.title}</p>
                  <p className="font-mono text-[12px] tabular-nums text-ink-muted">
                    {formatCurrency(artwork.price, artwork.currency)}
                  </p>
                  <div className="mt-1">
                    <ArtworkStatusBadge status={artwork.status} />
                  </div>
                </div>
                <Link
                  href={`/artist/artworks/${artwork.id}/edit`}
                  className="shrink-0 flex items-center gap-0.5 text-[12px] text-ink-muted hover:text-ink transition-colors"
                >
                  Edit <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

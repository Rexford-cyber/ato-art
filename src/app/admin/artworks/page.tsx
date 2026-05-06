import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import ArtworkStatusBadge from "@/components/artworks/ArtworkStatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderation Queue" };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"] as const;

export default async function AdminArtworksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = (params.status ?? "PENDING") as string;

  const [artworks, pendingCount] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: statusFilter as never },
      orderBy: { submittedAt: "asc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artist: { select: { name: true, username: true, email: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.artwork.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
          Admin
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Moderation queue
        </h1>
        {pendingCount > 0 && (
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            <span className="font-medium text-ochre">{pendingCount}</span> artwork{pendingCount !== 1 ? "s" : ""} awaiting review
          </p>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/artworks?status=${s}`}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors duration-[180ms] ${
              statusFilter === s
                ? "border-ink bg-ink text-background"
                : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
            }`}
          >
            {s.toLowerCase()}
          </Link>
        ))}
      </div>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-16 text-center">
          <p className="font-display text-[17px] font-semibold text-ink">
            No {statusFilter.toLowerCase()} artworks.
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
                    Artwork
                  </th>
                  <th className="hidden px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft md:table-cell">
                    Artist
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {artworks.map((artwork) => (
                  <tr key={artwork.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-muted">
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
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <p className="text-ink">{artwork.artist.name}</p>
                      <p className="text-[12px] text-ink-soft">{artwork.artist.email}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono tabular-nums text-ink">
                      {formatCurrency(artwork.price, artwork.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ArtworkStatusBadge status={artwork.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/artworks/${artwork.id}`} className="flex items-center gap-1">
                          Review <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/admin/artworks/${artwork.id}`}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:bg-muted/40"
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
                  <p className="text-[12px] text-ink-soft">{artwork.artist.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <ArtworkStatusBadge status={artwork.status} />
                    <span className="font-mono text-[11.5px] tabular-nums text-ink-muted">
                      {formatCurrency(artwork.price, artwork.currency)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.6} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

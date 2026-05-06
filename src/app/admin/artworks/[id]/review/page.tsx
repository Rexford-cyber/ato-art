import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import ArtworkStatusBadge from "@/components/artworks/ArtworkStatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review Artwork" };

interface PageProps { params: Promise<{ id: string }> }

export default async function ReviewArtworkPage({ params }: PageProps) {
  const { id } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tags: true,
      category: true,
      artist: {
        select: {
          id: true, name: true, email: true, username: true,
          artworks: { select: { status: true } },
        },
      },
    },
  });

  if (!artwork) notFound();

  const approvedCount = artwork.artist.artworks.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Artwork</h1>
        <ArtworkStatusBadge status={artwork.status} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {artwork.images[0] && (
              <Image
                src={artwork.images[0].url}
                alt={artwork.title}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          {artwork.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {artwork.images.map((img) => (
                <div key={img.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">{artwork.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{artwork.description}</p>
          </div>

          <div className="space-y-2 text-sm border rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{formatCurrency(artwork.price, artwork.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{artwork.category.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medium</span>
              <span className="capitalize">{artwork.medium.replace("_", " ").toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style</span>
              <span className="capitalize">{artwork.style.replace("_", " ").toLowerCase()}</span>
            </div>
            {artwork.width && artwork.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{artwork.width} × {artwork.height} cm</span>
              </div>
            )}
          </div>

          {/* Artist info */}
          <div className="border rounded-lg p-4 space-y-1">
            <p className="text-sm font-semibold">Artist</p>
            <p className="text-sm">{artwork.artist.name}</p>
            <p className="text-xs text-muted-foreground">{artwork.artist.email}</p>
            <p className="text-xs text-muted-foreground">{approvedCount} approved artworks</p>
          </div>

          {artwork.moderationNote && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              Previous rejection note: {artwork.moderationNote}
            </div>
          )}

          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artwork.tags.map((t) => (
                <span key={t.id} className="rounded-full border px-2 py-0.5 text-xs">{t.tag}</span>
              ))}
            </div>
          )}

          <ModerationActions artworkId={artwork.id} currentStatus={artwork.status} />
        </div>
      </div>
    </div>
  );
}

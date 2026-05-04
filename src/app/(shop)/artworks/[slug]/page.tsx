import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import AddToCartButton from "@/components/artworks/AddToCartButton";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });
  if (!artwork) return {};
  return {
    title: artwork.title,
    description: artwork.description.slice(0, 160),
    openGraph: { images: artwork.images[0]?.url ? [artwork.images[0].url] : [] },
  };
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tags: true,
      category: true,
      artist: {
        select: {
          id: true, name: true, username: true, avatarUrl: true,
          artistProfile: { select: { displayName: true, tagline: true, isVerified: true } },
        },
      },
    },
  });

  if (!artwork) notFound();

  const primaryImage = artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? artwork.title}
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
                <div key={img.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{artwork.category.name}</p>
            <h1 className="mt-1 text-3xl font-bold">{artwork.title}</h1>
          </div>

          <p className="text-3xl font-semibold">
            {formatCurrency(artwork.price, artwork.currency)}
          </p>

          {artwork.status === "SOLD" ? (
            <div className="rounded-lg bg-muted p-4 text-center text-muted-foreground">
              This artwork has been sold
            </div>
          ) : (
            <AddToCartButton
              artwork={{
                artworkId: artwork.id,
                title: artwork.title,
                artistName: artwork.artist.artistProfile?.displayName ?? artwork.artist.name,
                price: Number(artwork.price),
                currency: artwork.currency,
                imageUrl: primaryImage?.url ?? "",
                slug: artwork.slug,
              }}
            />
          )}

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{artwork.description}</p>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            {artwork.medium && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medium</span>
                <span className="capitalize">{artwork.medium.toLowerCase().replace("_", " ")}</span>
              </div>
            )}
            {artwork.width && artwork.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{artwork.width} × {artwork.height} cm</span>
              </div>
            )}
            {artwork.year && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span>{artwork.year}</span>
              </div>
            )}
          </div>

          {/* Artist */}
          <Link
            href={`/artists/${artwork.artist.username}`}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
              {artwork.artist.avatarUrl && (
                <Image src={artwork.artist.avatarUrl} alt={artwork.artist.name} fill className="object-cover" sizes="48px" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {artwork.artist.artistProfile?.displayName ?? artwork.artist.name}
              </p>
              {artwork.artist.artistProfile?.tagline && (
                <p className="text-xs text-muted-foreground">{artwork.artist.artistProfile.tagline}</p>
              )}
            </div>
          </Link>

          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/artworks?q=${t.tag}`}
                  className="rounded-full border px-3 py-0.5 text-xs hover:bg-accent transition-colors"
                >
                  {t.tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

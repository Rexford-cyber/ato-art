import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/currency";
import AddToCartButton from "@/components/artworks/AddToCartButton";
import { ArrowUpRight } from "lucide-react";
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
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          artistProfile: { select: { displayName: true, tagline: true, isVerified: true, phone: true } },
        },
      },
    },
  });

  if (!artwork) notFound();

  const primaryImage = artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];
  const artistName = artwork.artist.artistProfile?.displayName ?? artwork.artist.name;
  const artistPhone = artwork.artist.artistProfile?.phone;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-8 pb-20 sm:px-6 lg:px-10 lg:pt-12">
      <nav className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-soft">
        <Link href="/artworks" className="transition-colors hover:text-ink">Works</Link>
        <span>&middot;</span>
        <Link href={`/artworks?category=${artwork.category.slug}`} className="transition-colors hover:text-ink">
          {artwork.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted">
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? artwork.title}
                fill
                priority
                unoptimized={primaryImage.url.startsWith("http")}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
              />
            )}
          </div>
          {artwork.images.length > 1 && (
            <div className="mt-4 grid grid-cols-6 gap-2">
              {artwork.images.map((img, i) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                  <Image
                    src={img.url}
                    alt={img.altText ?? `View ${i + 1}`}
                    fill
                    unoptimized={img.url.startsWith("http")}
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7 lg:col-span-5 lg:pt-2">
          <div>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">
              {artwork.category.name}{artwork.year ? `, ${artwork.year}` : ""}
            </p>
            <h1 className="font-display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-ink">
              {artwork.title}
            </h1>
            <p className="mt-3 text-[14.5px] text-ink-muted">
              by{" "}
              <Link href={`/artists/${artwork.artist.username}`} className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
                {artistName}
              </Link>
            </p>
          </div>

          <p className="font-mono text-[26px] tabular-nums text-ink">
            {formatCurrency(artwork.price, artwork.currency)}
          </p>

          {artwork.status === "SOLD" ? (
            <div className="rounded-md border border-border bg-muted/50 p-4 text-center text-[14px] text-ink-muted">
              This piece has been sold. Browse the artist&rsquo;s other works on their profile.
            </div>
          ) : (
            <AddToCartButton
              artwork={{
                artworkId: artwork.id,
                title: artwork.title,
                artistName,
                price: Number(artwork.price),
                currency: artwork.currency,
                imageUrl: primaryImage?.url ?? "",
                slug: artwork.slug,
              }}
            />
          )}

          <div className="border-t border-border pt-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">About the work</p>
            <p className="mt-3 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-muted whitespace-pre-line">
              {artwork.description}
            </p>
          </div>

          <dl className="border-t border-border pt-5 text-[13.5px]">
            <Spec label="Medium" value={artwork.medium ? artwork.medium.toLowerCase().replaceAll("_", " ") : null} capitalize />
            <Spec label="Dimensions" value={artwork.width && artwork.height ? `${artwork.width} x ${artwork.height} cm` : null} />
            <Spec label="Edition" value={artwork.isOriginal ? "Original, unique work" : "Limited edition"} />
            <Spec label="Year" value={artwork.year ? String(artwork.year) : null} />
          </dl>

          <div className="border-t border-border pt-7">
            <Link href={`/artists/${artwork.artist.username}`} className="group flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                {artwork.artist.avatarUrl && (
                  <Image
                    src={artwork.artist.avatarUrl}
                    alt={artistName}
                    fill
                    unoptimized={artwork.artist.avatarUrl.startsWith("http")}
                    className="object-cover"
                    sizes="56px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] font-medium text-ink">{artistName}</p>
                {artwork.artist.artistProfile?.tagline && (
                  <p className="truncate text-[12.5px] text-ink-muted">{artwork.artist.artistProfile.tagline}</p>
                )}
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-[240ms] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" strokeWidth={1.6} />
            </Link>

            {artistPhone && (
              <a
                href={`tel:${artistPhone.replace(/\s+/g, "")}`}
                className="mt-3 inline-flex items-center gap-2 font-mono text-[13px] tabular-nums text-ink-muted transition-colors hover:text-accent"
              >
                <span className="text-ink-soft">Reach the artist:</span>
                {artistPhone}
              </a>
            )}
          </div>

          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border pt-7">
              {artwork.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/artworks?q=${encodeURIComponent(t.tag)}`}
                  className="inline-flex items-center rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-ink-muted/40 hover:text-ink"
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

function Spec({ label, value, capitalize }: { label: string; value: string | null; capitalize?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`text-ink ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

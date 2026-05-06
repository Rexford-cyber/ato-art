import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ato's Art, Original African artwork by named artists",
  description:
    "Original paintings, photography, sculpture and more, sold directly by artists from across the continent.",
};

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 7,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artist: {
          select: {
            name: true,
            username: true,
            artistProfile: { select: { displayName: true } },
          },
        },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
  ]);

  const lead = featured[0];
  const rest = featured.slice(1, 7);

  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="lg:col-span-6 lg:pt-6 xl:col-span-6">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
              Volume {String(new Date().getFullYear()).slice(-2)}, ongoing
            </p>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,5.6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink">
              Original African art,{" "}
              <em className="text-accent">brought to you</em> by the people who made it.
            </h1>
            <p className="mt-7 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-muted">
              Painting, photography, sculpture, textile and print, sold directly by
              named artists across Ghana, Nigeria, Kenya, South Africa and beyond. No
              gallery markup, no anonymous catalog: every piece is signed, every
              maker is reachable.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/artworks">View the works</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/register/artist" className="gap-1">
                  Sell your work
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                </Link>
              </Button>
            </div>
          </div>

          {lead && lead.images[0] && (
            <Link href={`/artworks/${lead.slug}`} className="group lg:col-span-6 xl:col-span-6">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:aspect-[5/6]">
                <Image
                  src={lead.images[0].url}
                  alt={lead.title}
                  fill
                  priority
                  unoptimized={lead.images[0].url.startsWith("http")}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-display text-[17px] font-medium text-ink">
                    {lead.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {lead.artist.artistProfile?.displayName ?? lead.artist.name}
                    <span className="text-ink-soft"> &middot; {lead.category.name}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft transition-colors group-hover:text-ink">
                  Lead piece
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-20 pb-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink">
              Latest in the gallery
            </h2>
            <Link
              href="/artworks"
              className="group inline-flex items-center gap-1 text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              All works
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.6} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {rest.slice(0, 6).map((artwork, i) => (
              <div key={artwork.id} className={i === 0 || i === 5 ? "lg:row-span-2" : ""}>
                <ArtworkCard
                  artwork={artwork}
                  aspect={i === 0 || i === 5 ? "portrait" : "square"}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
                  Index
                </p>
                <h2 className="font-display mt-4 text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
                  By <em>medium</em>
                </h2>
                <p className="mt-5 max-w-[36ch] text-[14.5px] leading-relaxed text-ink-muted">
                  Pick a discipline. Each leads to its own room.
                </p>
              </div>

              <ul className="lg:col-span-8">
                {categories.map((cat, i) => (
                  <li key={cat.slug} className="border-b border-border last:border-b-0">
                    <Link
                      href={`/artworks?category=${cat.slug}`}
                      className="group flex items-baseline justify-between gap-4 py-5 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex items-baseline gap-5 sm:gap-7">
                        <span className="font-mono text-[12px] tabular-nums text-ink-soft">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-tight text-ink transition-colors group-hover:text-accent">
                          {cat.name}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-5 w-5 shrink-0 text-ink-soft transition-transform duration-[240ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={1.6}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-accent-soft">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-24 lg:px-8">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-accent">
              For artists
            </p>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
              Sell your work without losing the relationship.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[15.5px] leading-relaxed text-ink-muted">
              You upload, you set the price, you keep the conversation with the
              buyer. We handle the storefront, the order ledger, and the trust
              signals. Apply to join, get reviewed within five working days.
            </p>
          </div>
          <div className="flex items-end lg:col-span-5 lg:justify-end">
            <Button size="xl" asChild>
              <Link href="/register/artist" className="gap-1.5">
                Apply to sell
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

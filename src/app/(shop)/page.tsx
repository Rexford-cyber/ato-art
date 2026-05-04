import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ato's Art — African Art Marketplace",
  description: "Discover and buy original African artwork. Support artists across the continent.",
};

export default async function HomePage() {
  const [featured, categories, artistCount, artworkCount] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artist: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.user.count({ where: { role: "ARTIST" } }),
    prisma.artwork.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 to-stone-700 text-white py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            African Art, Brought to You
          </h1>
          <p className="mt-4 text-lg text-stone-300 max-w-xl mx-auto">
            Discover original paintings, sculptures, photography and more — directly from artists
            across the continent.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100">
              <Link href="/artworks">Browse Art</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link href="/register/artist">Sell Your Art</Link>
            </Button>
          </div>
          <div className="mt-10 flex justify-center gap-10 text-sm text-stone-400">
            <div><span className="block text-2xl font-bold text-white">{artworkCount}+</span>Artworks</div>
            <div><span className="block text-2xl font-bold text-white">{artistCount}+</span>Artists</div>
            <div><span className="block text-2xl font-bold text-white">15+</span>Countries</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 w-full">
          <h2 className="mb-6 text-2xl font-bold">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/artworks?category=${cat.slug}`}
                className="flex items-center justify-center rounded-xl border bg-muted/40 px-4 py-6 text-sm font-medium hover:bg-accent transition-colors text-center"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured artworks */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 w-full">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Works</h2>
            <Link href="/artworks" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      )}

      {/* CTA for artists */}
      <section className="bg-muted/50 py-16 px-4 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold">Are you an artist?</h2>
          <p className="mt-2 text-muted-foreground">
            Join hundreds of African artists selling their work on our platform. We handle payments,
            you focus on your art.
          </p>
          <Button asChild className="mt-6">
            <Link href="/register/artist">Start Selling Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Art" };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ArtworksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "APPROVED" };
  if (params.category) where.category = { slug: params.category };
  if (params.medium) where.medium = params.medium;
  if (params.style) where.style = params.style;
  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
    };
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [artworks, total, categories] = await Promise.all([
    prisma.artwork.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artist: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.artwork.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Art</h1>
          <p className="text-muted-foreground mt-1">{total} works available</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="mb-3 text-sm font-semibold">Category</p>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/artworks" className="text-muted-foreground hover:text-foreground">
                All
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <a
                  href={`/artworks?category=${cat.slug}`}
                  className={`hover:text-foreground ${
                    params.category === cat.slug ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-2xl font-semibold">No artworks found</p>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/artworks?${new URLSearchParams({ ...params, page: String(p) })}`}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm border transition-colors ${
                        p === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

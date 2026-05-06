import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import MobileFilters from "@/components/artworks/MobileFilters";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Works" };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const MEDIUMS = [
  { value: "OIL", label: "Oil" },
  { value: "ACRYLIC", label: "Acrylic" },
  { value: "WATERCOLOUR", label: "Watercolour" },
  { value: "PENCIL", label: "Pencil" },
  { value: "CHARCOAL", label: "Charcoal" },
  { value: "DIGITAL", label: "Digital" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "TEXTILE", label: "Textile" },
  { value: "SCULPTURE", label: "Sculpture" },
  { value: "PRINT", label: "Print" },
  { value: "MIXED_MEDIA", label: "Mixed media" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function ArtworksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
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

  const sort = params.sort ?? "newest";
  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [artworks, total, categories] = await Promise.all([
    prisma.artwork.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = { ...params, ...overrides };
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined && v !== "") clean[k] = v;
    }
    if (Object.keys(overrides).some((k) => k !== "page")) delete clean.page;
    return `/artworks?${new URLSearchParams(clean)}`;
  }

  const hasFilters = !!(params.category || params.medium || params.style || params.q || params.minPrice || params.maxPrice);

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
                Collection
              </p>
              <h1 className="font-display mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.018em] text-ink">
                {params.q ? (
                  <>Search: <em>{params.q}</em></>
                ) : params.category ? (
                  categories.find((c) => c.slug === params.category)?.name ?? "Browse"
                ) : (
                  "All works"
                )}
              </h1>
            </div>
            <p className="font-mono text-[12px] tabular-nums text-ink-soft pb-1">
              {total} {total === 1 ? "work" : "works"}
            </p>
          </div>

          {/* Search bar + mobile filter button */}
          <div className="mt-5 flex items-center gap-3">
            <form action="/artworks" method="GET" className="flex-1">
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.medium && <input type="hidden" name="medium" value={params.medium} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              <input
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search artworks…"
                className="h-9 w-full rounded-sm border border-input bg-transparent px-3 font-mono text-[13px] text-ink placeholder:text-ink-soft/50 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors"
              />
            </form>
            <MobileFilters
              categories={categories}
              mediums={MEDIUMS}
              sorts={SORTS}
              params={params}
              buildHref={buildHref}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden w-48 shrink-0 lg:block">
            <div className="sticky top-24 space-y-7">
              {/* Categories */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Category
                </p>
                <div className="flex flex-col gap-1">
                  <Link
                    href={buildHref({ category: undefined })}
                    className={`text-[13px] transition-colors ${!params.category ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`}
                  >
                    All
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={buildHref({ category: c.slug })}
                      className={`text-[13px] transition-colors ${params.category === c.slug ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Medium */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Medium
                </p>
                <div className="flex flex-col gap-1">
                  <Link
                    href={buildHref({ medium: undefined })}
                    className={`text-[13px] transition-colors ${!params.medium ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`}
                  >
                    All
                  </Link>
                  {MEDIUMS.map((m) => (
                    <Link
                      key={m.value}
                      href={buildHref({ medium: m.value })}
                      className={`text-[13px] transition-colors ${params.medium === m.value ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Sort
                </p>
                <div className="flex flex-col gap-1">
                  {SORTS.map((s) => (
                    <Link
                      key={s.value}
                      href={buildHref({ sort: s.value })}
                      className={`text-[13px] transition-colors ${(params.sort ?? "newest") === s.value ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <Link
                  href="/artworks"
                  className="flex items-center gap-1 text-[12px] text-ink-soft underline underline-offset-2 hover:text-ink transition-colors"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </aside>

          {/* Artwork grid */}
          <div className="flex-1 min-w-0">
            {artworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">No artworks found</p>
                <p className="mt-2 text-[14px] text-ink-muted">Try adjusting your filters.</p>
                {hasFilters && (
                  <Link href="/artworks" className="mt-4 flex items-center gap-1 text-[13px] text-ink underline underline-offset-2">
                    Clear all filters <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildHref({ page: String(page - 1) })}
                    className="rounded-sm border border-border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    Prev
                  </Link>
                )}
                <span className="font-mono text-[12px] text-ink-soft">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildHref({ page: String(page + 1) })}
                    className="rounded-sm border border-border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

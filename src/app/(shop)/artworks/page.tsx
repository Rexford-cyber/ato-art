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
    // Remove undefined values and reset page when filter changes
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
          <form method="GET" action="/artworks" className="mt-5">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.medium && <input type="hidden" name="medium" value={params.medium} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            <div className="flex items-center gap-2">
              <input
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search by title, description…"
                className="h-10 w-full max-w-md rounded-md border border-border bg-surface px-4 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-ink-soft focus:outline-none focus:ring-1 focus:ring-ink-soft/30 transition-colors duration-[180ms]"
              />
              <MobileFilters
                categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
                mediums={MEDIUMS}
                sorts={SORTS}
                currentParams={params}
                activeCount={[params.category, params.medium, params.style].filter(Boolean).length}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-10 lg:gap-14">
          {/* Sidebar */}
          <aside className="hidden w-44 shrink-0 md:block">
            <div className="sticky top-20 space-y-8">
              {/* Sort */}
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                  Sort
                </p>
                <ul className="mt-3 space-y-1">
                  {SORTS.map((s) => (
                    <li key={s.value}>
                      <Link
                        href={buildHref({ sort: s.value })}
                        className={`block text-[13px] transition-colors duration-[180ms] hover:text-ink ${
                          (params.sort ?? "newest") === s.value
                            ? "font-medium text-ink"
                            : "text-ink-muted"
                        }`}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category */}
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                  Category
                </p>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      href={buildHref({ category: undefined })}
                      className={`block text-[13px] transition-colors duration-[180ms] hover:text-ink ${
                        !params.category ? "font-medium text-ink" : "text-ink-muted"
                      }`}
                    >
                      All
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={buildHref({ category: cat.slug })}
                        className={`block text-[13px] transition-colors duration-[180ms] hover:text-ink ${
                          params.category === cat.slug
                            ? "font-medium text-ink"
                            : "text-ink-muted"
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medium */}
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                  Medium
                </p>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      href={buildHref({ medium: undefined })}
                      className={`block text-[13px] transition-colors duration-[180ms] hover:text-ink ${
                        !params.medium ? "font-medium text-ink" : "text-ink-muted"
                      }`}
                    >
                      All
                    </Link>
                  </li>
                  {MEDIUMS.map((m) => (
                    <li key={m.value}>
                      <Link
                        href={buildHref({ medium: m.value })}
                        className={`block text-[13px] transition-colors duration-[180ms] hover:text-ink ${
                          params.medium === m.value
                            ? "font-medium text-ink"
                            : "text-ink-muted"
                        }`}
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clear */}
              {hasFilters && (
                <Link
                  href="/artworks"
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brick transition-colors hover:text-brick/70"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile: filter chips row */}
            <div className="mb-5 flex flex-wrap items-center gap-2 md:hidden">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.slug}
                  href={buildHref({ category: cat.slug })}
                  className={`rounded-sm border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors duration-[180ms] ${
                    params.category === cat.slug
                      ? "border-ink bg-ink text-background"
                      : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {artworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
                  Nothing here.
                </p>
                <p className="mt-2 text-[14px] text-ink-muted">
                  Try adjusting your filters, or{" "}
                  <Link href="/artworks" className="text-ink underline underline-offset-[3px] decoration-ink-soft hover:decoration-accent transition-colors">
                    browse everything
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {artworks.map((artwork, i) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      priority={i < 4}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-1.5">
                    {page > 1 && (
                      <Link
                        href={buildHref({ page: String(page - 1) })}
                        className="inline-flex h-9 items-center gap-1 rounded px-3 text-[13px] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                      >
                        ← Prev
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                      .reduce<(number | "…")[]>((acc, p, i, arr) => {
                        if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-[13px] text-ink-soft">…</span>
                        ) : (
                          <Link
                            key={p}
                            href={buildHref({ page: String(p) })}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded text-[13px] font-medium transition-colors duration-[180ms] ${
                              p === page
                                ? "bg-ink text-background"
                                : "text-ink-muted hover:bg-muted hover:text-ink"
                            }`}
                          >
                            {p}
                          </Link>
                        )
                      )}
                    {page < totalPages && (
                      <Link
                        href={buildHref({ page: String(page + 1) })}
                        className="inline-flex h-9 items-center gap-1 rounded px-3 text-[13px] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

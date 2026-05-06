"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterOption { value: string; label: string; }

interface MobileFiltersProps {
  categories: FilterOption[];
  mediums: FilterOption[];
  sorts: FilterOption[];
  currentParams: Record<string, string>;
  activeCount: number;
}

export default function MobileFilters({
  categories,
  mediums,
  sorts,
  currentParams,
  activeCount,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = { ...currentParams, ...overrides };
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined && v !== "") clean[k] = v;
    }
    // Reset page on filter change
    if (Object.keys(overrides).some((k) => k !== "page")) delete clean.page;
    return `/artworks?${new URLSearchParams(clean)}`;
  }

  const currentSort = currentParams.sort ?? "newest";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-ink-muted transition-colors hover:border-ink-soft/50 hover:text-ink md:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] text-background">
            {activeCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-xl bg-background px-0 pb-0">
          <SheetHeader className="border-b border-border px-5 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-[18px] font-semibold tracking-tight text-ink">
                Filter &amp; sort
              </SheetTitle>
              {activeCount > 0 && (
                <Link
                  href="/artworks"
                  onClick={() => setOpen(false)}
                  className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-brick"
                >
                  Clear all
                </Link>
              )}
            </div>
          </SheetHeader>

          <div className="overflow-y-auto px-5 py-5 space-y-7">
            {/* Sort */}
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft mb-3">
                Sort
              </p>
              <div className="flex flex-wrap gap-2">
                {sorts.map((s) => (
                  <Link
                    key={s.value}
                    href={buildHref({ sort: s.value })}
                    onClick={() => setOpen(false)}
                    className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                      currentSort === s.value
                        ? "border-ink bg-ink text-background"
                        : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft mb-3">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref({ category: undefined })}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                    !currentParams.category
                      ? "border-ink bg-ink text-background"
                      : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                  }`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.value}
                    href={buildHref({ category: cat.value })}
                    onClick={() => setOpen(false)}
                    className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                      currentParams.category === cat.value
                        ? "border-ink bg-ink text-background"
                        : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                    }`}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Medium */}
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft mb-3">
                Medium
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref({ medium: undefined })}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                    !currentParams.medium
                      ? "border-ink bg-ink text-background"
                      : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                  }`}
                >
                  All
                </Link>
                {mediums.map((m) => (
                  <Link
                    key={m.value}
                    href={buildHref({ medium: m.value })}
                    onClick={() => setOpen(false)}
                    className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                      currentParams.medium === m.value
                        ? "border-ink bg-ink text-background"
                        : "border-border text-ink-muted hover:border-ink-muted/50 hover:text-ink"
                    }`}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Safe area padding */}
          <div className="h-6" />
        </SheetContent>
      </Sheet>
    </>
  );
}

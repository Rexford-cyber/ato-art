import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artists" };

export default async function ArtistsPage() {
  const artists = await prisma.user.findMany({
    where: {
      role: { in: ["ARTIST", "ADMIN"] },
      artworks: { some: { status: "APPROVED" } },
    },
    orderBy: { createdAt: "asc" },
    include: {
      artistProfile: true,
      _count: { select: { artworks: { where: { status: "APPROVED" } } } },
    },
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 lg:px-8 lg:pt-20 lg:pb-20">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            The makers
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-ink">
            Artists on the platform
          </h1>
          <p className="mt-5 max-w-[54ch] text-[15.5px] leading-relaxed text-ink-muted">
            Every piece on Ato&rsquo;s Art is made by a named person. Browse their
            profiles, read their work, and reach them directly.
          </p>
          <p className="mt-4 font-mono text-[12px] tabular-nums text-ink-soft">
            {artists.length} {artists.length === 1 ? "artist" : "artists"} currently showing
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {artists.length === 0 ? (
          <p className="text-[14.5px] text-ink-muted">No artists yet. Check back soon.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => {
              const profile = artist.artistProfile;
              const displayName = profile?.displayName ?? artist.name;
              const count = artist._count.artworks;

              return (
                <li key={artist.id}>
                  <Link
                    href={`/artists/${artist.username}`}
                    className="group block"
                  >
                    {/* Avatar / Banner */}
                    <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-muted">
                      {profile?.bannerUrl ? (
                        <Image
                          src={profile.bannerUrl}
                          alt={`${displayName} banner`}
                          fill
                          unoptimized={profile.bannerUrl.startsWith("http")}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-accent-soft">
                          <span className="font-display text-[3.5rem] font-semibold leading-none tracking-tight text-accent/40 select-none">
                            {displayName.slice(0, 1)}
                          </span>
                        </div>
                      )}

                      {/* Avatar overlay */}
                      <div className="absolute bottom-3 left-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted ring-2 ring-background">
                          {artist.avatarUrl ? (
                            <Image
                              src={artist.avatarUrl}
                              alt={displayName}
                              fill
                              unoptimized={artist.avatarUrl.startsWith("http")}
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-ink-soft">
                              <span className="font-display text-[15px] font-medium">
                                {displayName.slice(0, 1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-[17px] font-medium leading-snug text-ink">
                          {displayName}
                        </p>
                        {profile?.tagline && (
                          <p className="mt-1 line-clamp-1 text-[13px] text-ink-muted">
                            {profile.tagline}
                          </p>
                        )}
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                          {count} {count === 1 ? "work" : "works"}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft transition-transform duration-[240ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={1.6}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-accent-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-accent">
                For artists
              </p>
              <h2 className="font-display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
                Want to be on this list?
              </h2>
              <p className="mt-2 max-w-[48ch] text-[14.5px] text-ink-muted">
                Apply to sell your work. We review within five working days.
              </p>
            </div>
            <Link
              href="/register/artist"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-5 py-3 text-[14px] font-medium text-background transition-colors duration-[180ms] hover:bg-accent"
            >
              Apply to sell
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

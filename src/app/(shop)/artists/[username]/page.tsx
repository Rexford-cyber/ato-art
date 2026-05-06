import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import MessageArtistButton from "@/components/artist/MessageArtistButton";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { artistProfile: true },
  });
  if (!user) return {};
  return { title: user.artistProfile?.displayName ?? user.name };
}

export default async function ArtistProfilePage({ params }: PageProps) {
  const { username } = await params;

  const artist = await prisma.user.findUnique({
    where: { username },
    include: {
      artistProfile: true,
      artworks: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 24,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
          artist: { select: { name: true, username: true } },
        },
      },
    },
  });

  if (!artist || artist.role === "BUYER") notFound();

  const profile = artist.artistProfile;
  const displayName = profile?.displayName ?? artist.name;

  return (
    <div className="flex flex-col">
      {profile?.bannerUrl ? (
        <div className="relative h-[280px] w-full overflow-hidden bg-muted lg:h-[380px]">
          <Image
            src={profile.bannerUrl}
            alt={`${displayName} banner`}
            fill
            unoptimized={profile.bannerUrl.startsWith("http")}
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="h-12 border-b border-border" />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-8 ${profile?.bannerUrl ? "-mt-14 lg:-mt-20" : "pt-10"} pb-12 lg:flex-row lg:items-end lg:justify-between`}>
          <div className="flex items-end gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-4 ring-background lg:h-32 lg:w-32">
              {artist.avatarUrl && (
                <Image
                  src={artist.avatarUrl}
                  alt={displayName}
                  fill
                  unoptimized={artist.avatarUrl.startsWith("http")}
                  sizes="128px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="pb-1">
              <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">Artist</p>
              <h1 className="font-display mt-2 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.018em] text-ink">
                {displayName}
              </h1>
              {profile?.tagline && (
                <p className="mt-1.5 max-w-[48ch] text-[14.5px] text-ink-muted">{profile.tagline}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {profile?.phone && (
              <a
                href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center font-mono text-[13px] tabular-nums text-ink transition-colors hover:text-accent"
              >
                {profile.phone}
              </a>
            )}
            {profile?.instagramHandle && (
              <a
                href={`https://instagram.com/${profile.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[13px] text-ink-muted transition-colors hover:text-ink"
              >
                @{profile.instagramHandle} on Instagram
              </a>
            )}
            <MessageArtistButton artistId={artist.id} artistName={displayName} />
          </div>
        </div>

        <section className="border-t border-border pt-12 pb-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-[26px] font-semibold tracking-tight text-ink">Works</h2>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">
              {artist.artworks.length} {artist.artworks.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {artist.artworks.length === 0 ? (
            <p className="mt-12 text-[14.5px] text-ink-muted">
              No approved works yet. Check back soon.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {artist.artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

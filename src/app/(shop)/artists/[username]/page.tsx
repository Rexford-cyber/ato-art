import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArtworkCard from "@/components/artworks/ArtworkCard";
import MessageArtistButton from "@/components/artist/MessageArtistButton";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, include: { artistProfile: true } });
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Banner */}
      {profile?.bannerUrl && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl bg-muted">
          <Image src={profile.bannerUrl} alt="Banner" fill className="object-cover" />
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-4 ring-background">
            {artist.avatarUrl && (
              <Image src={artist.avatarUrl} alt={artist.name} fill className="object-cover" sizes="80px" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.displayName ?? artist.name}</h1>
            {profile?.tagline && <p className="text-muted-foreground">{profile.tagline}</p>}
            <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
              {profile?.instagramHandle && (
                <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  @{profile.instagramHandle}
                </a>
              )}
            </div>
          </div>
        </div>
        <MessageArtistButton artistId={artist.id} artistName={profile?.displayName ?? artist.name} />
      </div>

      {/* Artworks */}
      <h2 className="mb-4 text-xl font-semibold">Works ({artist.artworks.length})</h2>
      {artist.artworks.length === 0 ? (
        <p className="text-muted-foreground">No approved artworks yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {artist.artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}

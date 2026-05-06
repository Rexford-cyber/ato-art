import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artists – Admin" };

export default async function AdminArtistsPage() {
  const artists = await prisma.user.findMany({
    where: { role: "ARTIST" },
    orderBy: { createdAt: "desc" },
    include: {
      artistProfile: {
        select: {
          displayName: true,
          isVerified: true,
          totalSales: true,
          totalRevenue: true,
        },
      },
      _count: {
        select: { artworks: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">{artists.length}</span> registered artist{artists.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-lg font-semibold">No artists yet</p>
          <p className="text-sm mt-1">Artists will appear here once they register.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Artist</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Username</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Artworks</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Revenue</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {artists.map((artist) => (
                <tr key={artist.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                        {artist.avatarUrl ? (
                          <Image
                            src={artist.avatarUrl}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[140px]">{artist.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{artist.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    <Link
                      href={`/artists/${artist.username}`}
                      className="hover:underline"
                      target="_blank"
                    >
                      @{artist.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {artist._count.artworks}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {formatCurrency(Number(artist.artistProfile?.totalRevenue ?? 0), "GHS")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {artist.artistProfile?.isVerified ? (
                        <Badge variant="default" className="w-fit text-xs">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit text-xs">Unverified</Badge>
                      )}
                      {!artist.isActive && (
                        <Badge variant="destructive" className="w-fit text-xs">Suspended</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(artist.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

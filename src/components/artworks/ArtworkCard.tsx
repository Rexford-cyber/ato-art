import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";

interface ArtworkCardProps {
  artwork: {
    id: string;
    slug: string;
    title: string;
    price: number | string;
    currency: string;
    status: string;
    images: { url: string; altText?: string | null }[];
    artist: { name: string; username: string };
    category: { name: string };
  };
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const image = artwork.images[0];

  return (
    <Link href={`/artworks/${artwork.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-muted aspect-square relative">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? artwork.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {artwork.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-base px-4 py-1">Sold</Badge>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-medium truncate">{artwork.title}</p>
        <p className="text-xs text-muted-foreground">{artwork.artist.name}</p>
        <p className="text-sm font-semibold">{formatCurrency(artwork.price, artwork.currency)}</p>
      </div>
    </Link>
  );
}

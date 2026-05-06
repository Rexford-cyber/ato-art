import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";

interface ArtworkCardProps {
  artwork: {
    id: string;
    slug: string;
    title: string;
    price: number | string | { toString(): string };
    currency: string;
    status: string;
    images: { url: string; altText?: string | null }[];
    artist: { name: string; username: string };
    category: { name: string };
  };
  aspect?: "square" | "portrait";
  priority?: boolean;
}

export default function ArtworkCard({ artwork, aspect = "square", priority = false }: ArtworkCardProps) {
  const image = artwork.images[0];
  const sold = artwork.status === "SOLD";

  return (
    <Link href={`/artworks/${artwork.slug}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-md bg-muted ${
          aspect === "portrait" ? "aspect-[4/5]" : "aspect-square"
        }`}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? artwork.title}
            fill
            unoptimized={image.url.startsWith("http")}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft">
            <span className="font-mono text-[11px] tracking-wide">no image</span>
          </div>
        )}
        {sold && (
          <div className="absolute inset-0 flex items-end p-3">
            <span className="rounded-sm bg-ink/85 px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-background">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-[15px] font-medium leading-snug text-ink truncate">
          {artwork.title}
        </p>
        <p className="shrink-0 font-mono text-[12.5px] tabular-nums text-ink">
          {formatCurrency(artwork.price, artwork.currency)}
        </p>
      </div>
      <p className="mt-0.5 text-[12.5px] text-ink-muted">{artwork.artist.name}</p>
    </Link>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils/currency";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, totalPrice } = useCartStore();
  const currency = items[0]?.currency ?? "GHS";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="flex w-full flex-col bg-background p-0 sm:max-w-[400px]">
        {/* Header */}
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                Cart
              </p>
              <SheetTitle className="font-display mt-1 text-[19px] font-semibold tracking-tight text-ink">
                {items.length === 0
                  ? "Empty"
                  : `${items.length} ${items.length === 1 ? "piece" : "pieces"}`}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-ink-soft" strokeWidth={1.4} />
            </div>
            <div>
              <p className="font-display text-[18px] font-semibold text-ink">
                Nothing here yet.
              </p>
              <p className="mt-1.5 text-[13.5px] text-ink-muted">
                Add pieces from the gallery.
              </p>
            </div>
            <Button asChild onClick={onClose} className="mt-1">
              <Link href="/artworks" className="gap-1.5">
                Browse the collection
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.artworkId} className="flex gap-4 py-5">
                    <Link
                      href={`/artworks/${item.slug}`}
                      onClick={onClose}
                      className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-sm bg-muted"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        unoptimized={item.imageUrl.startsWith("http")}
                        className="object-cover transition-transform duration-[400ms] hover:scale-[1.04]"
                        sizes="72px"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div>
                        <Link
                          href={`/artworks/${item.slug}`}
                          onClick={onClose}
                          className="font-display block truncate text-[14.5px] font-medium leading-snug text-ink transition-colors hover:text-accent"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-ink-muted">{item.artistName}</p>
                      </div>
                      <p className="font-mono text-[13px] tabular-nums text-ink">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.artworkId)}
                      aria-label={`Remove ${item.title}`}
                      className="mt-0.5 h-7 w-7 shrink-0 rounded text-ink-soft transition-colors duration-[180ms] hover:text-brick"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-ink-muted">Total</span>
                <span className="font-mono text-[18px] tabular-nums text-ink">
                  {formatCurrency(totalPrice(), currency)}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-soft">
                Shipping arranged directly with the artist after order.
              </p>
              <Button className="mt-4 w-full gap-1.5" asChild onClick={onClose}>
                <Link href="/checkout">
                  Proceed to checkout
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </Link>
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="mt-2.5 w-full text-center text-[13px] text-ink-muted transition-colors hover:text-ink"
              >
                Continue browsing
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

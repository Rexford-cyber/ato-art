"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";
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
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button asChild onClick={onClose}>
              <Link href="/artworks">Browse Art</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.artworkId} className="flex gap-4 py-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/artworks/${item.slug}`}
                      className="text-sm font-medium hover:underline"
                      onClick={onClose}
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.artistName}</p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(item.price, item.currency)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.artworkId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totalPrice(), currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Shipping calculated at checkout</p>
              <Separator className="mb-4" />
              <Button className="w-full" asChild onClick={onClose}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

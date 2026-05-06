"use client";

import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";

interface AddToCartButtonProps {
  artwork: Omit<CartItem, "quantity">;
}

export default function AddToCartButton({ artwork }: AddToCartButtonProps) {
  const { addItem, items } = useCartStore();
  const inCart = items.some((i) => i.artworkId === artwork.artworkId);

  function handleAdd() {
    if (inCart) return;
    addItem(artwork);
    toast.success("Added to cart", { description: artwork.title });
  }

  return (
    <Button
      size="xl"
      className="w-full justify-center gap-2"
      onClick={handleAdd}
      disabled={inCart}
      variant={inCart ? "secondary" : "default"}
    >
      <span className="relative inline-flex items-center gap-2">
        <span
          className={
            "inline-flex items-center gap-2 transition-[opacity,filter] duration-[240ms] " +
            (inCart ? "opacity-0 blur-[3px]" : "opacity-100 blur-0")
          }
          aria-hidden={inCart}
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.7} />
          Add to cart
        </span>
        <span
          className={
            "absolute inset-0 inline-flex items-center justify-center gap-2 transition-[opacity,filter] duration-[240ms] " +
            (inCart ? "opacity-100 blur-0" : "opacity-0 blur-[3px]")
          }
          aria-hidden={!inCart}
        >
          <Check className="h-[18px] w-[18px]" strokeWidth={1.7} />
          In your cart
        </span>
      </span>
    </Button>
  );
}

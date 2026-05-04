"use client";

import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Check } from "lucide-react";

interface AddToCartButtonProps {
  artwork: Omit<CartItem, "quantity">;
}

export default function AddToCartButton({ artwork }: AddToCartButtonProps) {
  const { addItem, items } = useCartStore();
  const inCart = items.some((i) => i.artworkId === artwork.artworkId);

  function handleAdd() {
    addItem(artwork);
    toast.success("Added to cart", { description: artwork.title });
  }

  return (
    <Button
      size="lg"
      className="w-full gap-2"
      onClick={handleAdd}
      disabled={inCart}
      variant={inCart ? "secondary" : "default"}
    >
      {inCart ? (
        <>
          <Check className="h-5 w-5" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}

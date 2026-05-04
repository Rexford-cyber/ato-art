"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils/currency";
import { shippingSchema, type ShippingInput } from "@/lib/validations/order";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const currency = items[0]?.currency ?? "GHS";

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingInput>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingName: session?.user?.name ?? "",
      shippingEmail: session?.user?.email ?? "",
      shippingCountry: "GH",
    },
  });

  async function onSubmit(shipping: ShippingInput) {
    if (items.length === 0) return;
    setLoading(true);

    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ artworkId: i.artworkId, quantity: i.quantity })),
        ...shipping,
      }),
    });
    const order = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      toast.error(order.error ?? "Failed to create order");
      return;
    }

    const payRes = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const payData = await payRes.json();

    if (!payRes.ok) {
      setLoading(false);
      toast.error(payData.error ?? "Payment initialization failed");
      return;
    }

    clearCart();
    window.location.href = payData.authorizationUrl;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-2xl font-semibold">Your cart is empty</p>
        <Button asChild className="mt-4">
          <a href="/artworks">Browse Art</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Shipping form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Details</h2>
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input {...register("shippingName")} />
            {errors.shippingName && <p className="text-xs text-destructive">{errors.shippingName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" {...register("shippingEmail")} />
            {errors.shippingEmail && <p className="text-xs text-destructive">{errors.shippingEmail.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input type="tel" {...register("shippingPhone")} placeholder="+233 xx xxx xxxx" />
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input {...register("shippingAddress")} />
            {errors.shippingAddress && <p className="text-xs text-destructive">{errors.shippingAddress.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>City</Label>
              <Input {...register("shippingCity")} />
              {errors.shippingCity && <p className="text-xs text-destructive">{errors.shippingCity.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Country (2-letter)</Label>
              <Input {...register("shippingCountry")} maxLength={2} placeholder="GH" />
              {errors.shippingCountry && <p className="text-xs text-destructive">{errors.shippingCountry.message}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Redirecting to Paystack…" : `Pay ${formatCurrency(totalPrice(), currency)}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Paystack — cards, mobile money, bank transfer
          </p>
        </form>

        {/* Order summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.artworkId} className="flex justify-between text-sm">
                <span className="truncate max-w-[200px]">{item.title}</span>
                <span className="ml-4 shrink-0">{formatCurrency(item.price, item.currency)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalPrice(), currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

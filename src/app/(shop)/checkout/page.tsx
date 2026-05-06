"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils/currency";
import { shippingSchema, type ShippingInput } from "@/lib/validations/order";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

interface Field {
  label: string;
  sublabel?: string;
  error: string | undefined;
  children: React.ReactNode;
}

function Field({ label, sublabel, error, children }: Field) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-2">
        {label}
        {sublabel && <span className="font-normal text-ink-soft text-[11.5px]">{sublabel}</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const currency = items[0]?.currency ?? "GHS";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInput>({
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

    const orderJson = await orderRes.json();
    setLoading(false);

    if (!orderRes.ok) {
      toast.error(orderJson.error ?? "Failed to place order");
      return;
    }

    clearCart();
    router.push(`/checkout/success?orderId=${orderJson.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="h-10 w-10 text-ink-soft" strokeWidth={1.4} />
        <p className="font-display text-[18px] font-semibold text-ink">Your cart is empty</p>
        <Link href="/artworks" className="flex items-center gap-1 text-[13.5px] text-ink underline underline-offset-2">
          Browse artworks <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">Checkout</p>
      <h1 className="font-display mt-2 mb-10 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
        Complete your order
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Shipping form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
            Shipping details
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" error={errors.shippingName?.message}>
              <Input
                {...register("shippingName")}
                placeholder="Ama Owusu"
                className="bg-surface"
              />
            </Field>
            <Field label="Email" error={errors.shippingEmail?.message}>
              <Input
                type="email"
                {...register("shippingEmail")}
                placeholder="ama@example.com"
                className="bg-surface"
              />
            </Field>
          </div>

          <Field label="Phone" sublabel="Optional" error={errors.shippingPhone?.message}>
            <Input
              {...register("shippingPhone")}
              placeholder="+233 XX XXX XXXX"
              className="bg-surface"
            />
          </Field>

          <Field label="Address" error={errors.shippingAddress?.message}>
            <Input
              {...register("shippingAddress")}
              placeholder="123 Oxford Street, Apt 4B"
              className="bg-surface"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.shippingCity?.message}>
              <Input
                {...register("shippingCity")}
                placeholder="Accra"
                className="bg-surface"
              />
            </Field>
            <Field label="Country" error={errors.shippingCountry?.message}>
              <Input
                {...register("shippingCountry")}
                className="h-11 bg-surface font-mono uppercase tracking-widest"
              />
            </Field>
          </div>

          <Field
            label="Note for the artist"
            sublabel="Optional"
            error={undefined}
          >
            <Textarea
              rows={3}
              {...register("buyerNote")}
              placeholder="Anything the artist should know about your order…"
              className="resize-none bg-surface text-[14px]"
            />
          </Field>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full font-mono uppercase tracking-widest"
            >
              {loading ? "Placing order…" : "Place order"}
            </Button>
          </div>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-md border border-border bg-surface p-5">
          <p className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
            Order summary
          </p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.artworkId} className="flex items-start gap-3 text-[13.5px]">
                <div className="flex-1 text-ink leading-snug">{item.title}</div>
                <div className="shrink-0 tabular-nums text-ink-muted">
                  {formatCurrency(item.price * item.quantity, item.currency)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Total</span>
            <span className="font-display text-[17px] font-semibold text-ink tabular-nums">
              {formatCurrency(totalPrice, currency)}
            </span>
          </div>
          <p className="mt-3 text-[11.5px] text-ink-soft leading-relaxed">
            Payment is collected by the artist directly. Ato&apos;s Art facilitates the order only.
          </p>
        </aside>
      </div>
    </div>
  );
}

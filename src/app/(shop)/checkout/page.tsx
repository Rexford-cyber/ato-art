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
    const order = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      toast.error(order.error ?? "Failed to place order");
      return;
    }

    clearCart();
    router.push(`/checkout/success?orderId=${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-ink-soft" strokeWidth={1.4} />
        </div>
        <p className="font-display mt-5 text-[1.6rem] font-semibold tracking-tight text-ink">
          Your cart is empty.
        </p>
        <p className="mt-2 text-[14px] text-ink-muted">
          Add a piece before checking out.
        </p>
        <Button asChild className="mt-6 gap-1.5">
          <Link href="/artworks">
            Browse the collection
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
          Checkout
        </p>
        <h1 className="font-display mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Place your order
        </h1>
        <p className="mt-3 max-w-[56ch] text-[14.5px] text-ink-muted">
          No payment is taken now. Once you submit, the artist will contact you to
          confirm payment and arrange delivery directly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        {/* Shipping form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
            Shipping details
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.shippingName?.message}>
              <Input
                {...register("shippingName")}
                placeholder="Abena Mensah"
                className="h-11 bg-surface"
              />
            </Field>
            <Field label="Email" error={errors.shippingEmail?.message}>
              <Input
                type="email"
                {...register("shippingEmail")}
                placeholder="you@example.com"
                className="h-11 bg-surface"
              />
            </Field>
          </div>

          <Field label="Phone" error={undefined}>
            <Input
              type="tel"
              {...register("shippingPhone")}
              placeholder="+233 xx xxx xxxx"
              className="h-11 bg-surface"
            />
          </Field>

          <Field label="Street address" error={errors.shippingAddress?.message}>
            <Input
              {...register("shippingAddress")}
              placeholder="14 Independence Ave"
              className="h-11 bg-surface"
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="City" error={errors.shippingCity?.message}>
              <Input
                {...register("shippingCity")}
                placeholder="Accra"
                className="h-11 bg-surface"
              />
            </Field>
            <Field label="Country code" error={errors.shippingCountry?.message}>
              <Input
                {...register("shippingCountry")}
                maxLength={2}
                placeholder="GH"
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
              size="lg"
              className="w-full gap-2 sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                "Placing order…"
              ) : (
                <>
                  Place order · {formatCurrency(totalPrice(), currency)}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Order summary */}
        <aside>
          <div className="rounded-md border border-border bg-surface p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
              Order summary
            </p>
            <ul className="mt-5 divide-y divide-border">
              {items.map((item) => (
                <li key={item.artworkId} className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="line-clamp-1 text-[13.5px] text-ink">{item.title}</span>
                  <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-ink">
                    {formatCurrency(item.price, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-[13px] text-ink-muted">Total</span>
              <span className="font-mono text-[18px] tabular-nums text-ink">
                {formatCurrency(totalPrice(), currency)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
            This total is indicative. Shipping costs, if any, will be agreed
            directly with the artist after you place your order.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  sublabel,
  error,
  children,
}: {
  label: string;
  sublabel?: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-2 text-[12.5px] text-ink-muted">
        {label}
        {sublabel && (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft">
            {sublabel}
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-[12px] text-brick">{error}</p>
      )}
    </div>
  );
}

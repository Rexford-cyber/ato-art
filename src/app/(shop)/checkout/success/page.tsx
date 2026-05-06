"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSummary {
  id: string;
  orderNumber: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "missing">(
    orderId ? "loading" : "missing"
  );

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.id) {
          setOrder({ id: data.id, orderNumber: data.orderNumber });
          setStatus("success");
        } else {
          setStatus("missing");
        }
      })
      .catch(() => setStatus("missing"));
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ink" />
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft">
          Saving your order…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      {/* Success icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/15">
        <Check className="h-7 w-7 text-moss" strokeWidth={2} />
      </div>

      <p className="font-mono mt-7 text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
        Confirmed
      </p>
      <h1 className="font-display mt-3 text-[clamp(2rem,4vw,2.8rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-ink">
        Order placed.
      </h1>

      {order && (
        <p className="mt-2 font-mono text-[13px] tabular-nums text-ink-muted">
          #{order.orderNumber}
        </p>
      )}

      <p className="mt-6 text-[14.5px] leading-relaxed text-ink-muted">
        Thank you for supporting African art directly. The artist will be in
        touch shortly to confirm payment and arrange delivery.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="gap-1.5">
          <Link href="/buyer/orders">
            View my orders
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/artworks">Continue browsing</Link>
        </Button>
      </div>
    </div>
  );
}

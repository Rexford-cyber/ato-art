"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Saving your order…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
      <h1 className="text-3xl font-bold">Order placed</h1>
      {order && (
        <p className="mt-2 text-muted-foreground">Order #{order.orderNumber}</p>
      )}
      <p className="mt-4 text-muted-foreground">
        Thank you for your purchase. The artist will be in touch shortly to confirm
        payment and arrange delivery.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/buyer/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/artworks">Continue Browsing</Link>
        </Button>
      </div>
    </div>
  );
}

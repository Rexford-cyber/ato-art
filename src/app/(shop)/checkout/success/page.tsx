"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "pending">("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) { setStatus("pending"); return; }
    fetch(`/api/payments/verify?reference=${reference}`)
      .then((r) => r.json())
      .then((data) => {
        setOrderNumber(data.order?.orderNumber ?? null);
        setStatus(data.status === "success" ? "success" : "pending");
      })
      .catch(() => setStatus("pending"));
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Confirming your payment…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
      <h1 className="text-3xl font-bold">
        {status === "success" ? "Payment Successful!" : "Payment Received"}
      </h1>
      {orderNumber && (
        <p className="mt-2 text-muted-foreground">Order #{orderNumber}</p>
      )}
      <p className="mt-4 text-muted-foreground">
        Thank you for your purchase. The artist will be notified and will prepare your order.
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

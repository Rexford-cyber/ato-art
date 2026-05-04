"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpdateOrderStatusProps {
  orderId: string;
  nextStatus: "SHIPPED" | "DELIVERED";
  label: string;
}

export default function UpdateOrderStatus({ orderId, nextStatus, label }: UpdateOrderStatusProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Update failed"); return; }
    toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" disabled={loading} onClick={update}>
      {loading ? "Updating…" : label}
    </Button>
  );
}

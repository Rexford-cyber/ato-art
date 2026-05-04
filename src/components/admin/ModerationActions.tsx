"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ArtworkStatus } from "@prisma/client";
import { CheckCircle, XCircle, Archive } from "lucide-react";

interface ModerationActionsProps {
  artworkId: string;
  currentStatus: ArtworkStatus;
}

export default function ModerationActions({ artworkId, currentStatus }: ModerationActionsProps) {
  const router = useRouter();
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "APPROVED" | "REJECTED" | "ARCHIVED", note?: string) {
    if (status === "REJECTED" && !note?.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/artworks/${artworkId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, moderationNote: note }),
    });
    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Action failed");
      return;
    }

    const messages = {
      APPROVED: "Artwork approved — it is now live in the marketplace.",
      REJECTED: "Artwork rejected. The artist has been notified.",
      ARCHIVED: "Artwork archived and removed from the marketplace.",
    };
    toast.success(messages[status]);
    router.push("/admin/artworks");
    router.refresh();
  }

  const isPending = currentStatus === "PENDING";

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-sm font-semibold">Moderation Actions</p>

      {showRejectForm ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="rejectNote">Rejection reason <span className="text-destructive">*</span></Label>
            <Textarea
              id="rejectNote"
              rows={3}
              placeholder="Explain why this artwork is being rejected so the artist can improve their submission…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This message will be shown to the artist.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={loading || !rejectNote.trim()}
              onClick={() => updateStatus("REJECTED", rejectNote)}
            >
              {loading ? "Rejecting…" : "Confirm Reject"}
            </Button>
            <Button variant="outline" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(isPending || currentStatus === "REJECTED") && (
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={loading}
              onClick={() => updateStatus("APPROVED")}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
          {(isPending || currentStatus === "APPROVED") && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={loading}
              onClick={() => setShowRejectForm(true)}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          )}
          {currentStatus === "APPROVED" && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={loading}
              onClick={() => updateStatus("ARCHIVED")}
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface MessageArtistButtonProps {
  artistId: string;
  artistName: string;
}

export default function MessageArtistButton({ artistId, artistName }: MessageArtistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (session?.user?.id === artistId) return null;

  async function handleMessage() {
    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: artistId,
        initialMessage: `Hi ${artistName}! I'd love to connect with you about your artwork.`,
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error("Could not start conversation");
      return;
    }

    router.push(`/artist/messages/${json.conversationId}`);
  }

  return (
    <Button variant="outline" onClick={handleMessage} disabled={loading} className="gap-2">
      <MessageSquare className="h-4 w-4" />
      {loading ? "Opening…" : "Message Artist"}
    </Button>
  );
}

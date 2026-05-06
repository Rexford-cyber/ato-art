import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session) return null;

  const participantRows = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { messages: { _count: "desc" } } },
  });

  const conversations = participantRows.map((p) => {
    const other = p.conversation.participants.find((cp) => cp.userId !== session.user.id);
    const lastMessage = p.conversation.messages[0] ?? null;
    const unread =
      lastMessage && p.lastReadAt
        ? new Date(lastMessage.createdAt) > new Date(p.lastReadAt)
        : !!lastMessage;
    return {
      id: p.conversationId,
      other: other?.user,
      lastMessage,
      unread: unread && lastMessage?.senderId !== session.user.id,
    };
  });

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">No messages yet</p>
          <p className="text-muted-foreground mt-1">
            Visit an artist&apos;s profile to start a conversation
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border overflow-hidden">
          {conversations.map(({ id, other, lastMessage, unread }) => (
            <Link
              key={id}
              href={`/artist/messages/${id}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${unread ? "bg-muted/30" : ""}`}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {other?.avatarUrl && (
                  <Image src={other.avatarUrl} alt={other.name} fill className="object-cover" sizes="40px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${unread ? "font-semibold" : "font-medium"}`}>
                    {other?.name ?? "Unknown"}
                  </p>
                  {lastMessage && (
                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true })}
                    </p>
                  )}
                </div>
                {lastMessage && (
                  <p className={`text-xs truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                    {lastMessage.isDeleted ? "Message deleted" : lastMessage.content}
                  </p>
                )}
              </div>
              {unread && (
                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">Inbox</p>
        <h1 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Messages
        </h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <MessageSquare className="h-10 w-10 text-ink-soft" strokeWidth={1.4} />
          <p className="font-display mt-4 text-[17px] font-semibold text-ink">No messages yet.</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            Conversations with buyers will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
          {conversations.map(({ id, other, lastMessage, unread }) => (
            <Link
              key={id}
              href={`/artist/messages/${id}`}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 ${unread ? "bg-accent-soft/40" : ""}`}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {other?.avatarUrl && (
                  <Image src={other.avatarUrl} alt={other.name ?? ""} fill className="object-cover" sizes="40px" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-[13.5px] ${unread ? "font-semibold text-ink" : "font-medium text-ink-muted"}`}>
                    {other?.name ?? "Unknown"}
                  </p>
                  {lastMessage && (
                    <p className="shrink-0 font-mono text-[11px] text-ink-soft">
                      {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true })}
                    </p>
                  )}
                </div>
                {lastMessage && (
                  <p className={`mt-0.5 truncate text-[12.5px] ${unread ? "text-ink" : "text-ink-soft"}`}>
                    {lastMessage.isDeleted ? "Message deleted" : lastMessage.content}
                  </p>
                )}
              </div>
              {unread && <div className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

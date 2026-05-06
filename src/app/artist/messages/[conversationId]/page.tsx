import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import MessageThread from "@/components/messaging/MessageThread";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conversation" };

interface PageProps { params: Promise<{ conversationId: string }> }

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session) return null;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!participant) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });
  if (!conversation) notFound();

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });

  const otherUser = conversation.participants.find((p) => p.userId !== session.user.id)?.user;

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
          {otherUser?.avatarUrl && (
            <Image src={otherUser.avatarUrl} alt={otherUser.name ?? ""} fill className="object-cover" sizes="40px" unoptimized />
          )}
        </div>
        <div>
          <p className="font-medium text-ink">{otherUser?.name ?? "Unknown"}</p>
          <p className="text-[12px] text-ink-soft">@{otherUser?.username}</p>
        </div>
      </div>

      <MessageThread
        conversationId={conversationId}
        currentUserId={session.user.id}
        initialMessages={conversation.messages}
      />
    </div>
  );
}

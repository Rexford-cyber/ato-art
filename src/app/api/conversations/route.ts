import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newConversationSchema } from "@/lib/validations/message";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { messages: { _count: "desc" } } },
  });

  const conversations = participants.map((p) => {
    const lastMessage = p.conversation.messages[0] ?? null;
    const unreadCount = 0;
    const otherParticipants = p.conversation.participants.filter(
      (cp) => cp.userId !== session.user.id
    );
    return {
      id: p.conversationId,
      participants: otherParticipants.map((cp) => cp.user),
      lastMessage,
      unreadCount,
      lastReadAt: p.lastReadAt,
    };
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = newConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { recipientId, initialMessage } = parsed.data;

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    include: { participants: true },
  });

  if (existing) {
    await prisma.message.create({
      data: {
        conversationId: existing.id,
        senderId: session.user.id,
        content: initialMessage,
      },
    });
    return NextResponse.json({ conversationId: existing.id });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.user.id }, { userId: recipientId }],
      },
      messages: {
        create: { senderId: session.user.id, content: initialMessage },
      },
    },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}

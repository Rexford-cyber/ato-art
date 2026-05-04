import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: id, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

// GET /api/mobile/conversations — lista de conversaciones del usuario
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: session.id } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  // Count unread per conversation
  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversation: { participants: { some: { userId: session.id } } },
      senderId: { not: session.id },
      status: { not: "READ" },
    },
    _count: { id: true },
  });

  const unreadMap = Object.fromEntries(
    unreadCounts.map((u) => [u.conversationId, u._count.id])
  );

  const result = conversations.map((conv) => {
    const otherParticipants = conv.participants.filter((p) => p.userId !== session.id);
    const lastMessage = conv.messages[0] ?? null;
    return {
      id: conv.id,
      type: conv.type,
      bookingId: conv.bookingId,
      participants: otherParticipants.map((p) => p.user),
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
        : null,
      unreadCount: unreadMap[conv.id] ?? 0,
      updatedAt: conv.updatedAt,
    };
  });

  return corsJson({ data: result });
}

// POST /api/mobile/conversations — iniciar nueva conversación con otro usuario
// Body: { targetUserId: string }
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.targetUserId) {
    return corsJson({ error: "Se requiere targetUserId" }, { status: 400 });
  }

  const { targetUserId } = body as { targetUserId: string };

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "MATCH",
      participants: { every: { userId: { in: [session.id, targetUserId] } } },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  if (existing) return corsJson({ data: existing });

  const conversation = await prisma.conversation.create({
    data: {
      type: "MATCH",
      participants: {
        create: [{ userId: session.id }, { userId: targetUserId }],
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  return corsJson({ data: conversation }, { status: 201 });
}

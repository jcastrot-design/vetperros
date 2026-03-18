"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getConversations() {
  const session = await auth();
  if (!session) return [];

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Count unread messages per conversation
  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: session.user.id },
      status: { not: "READ" },
    },
    _count: true,
  });

  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count]));

  return conversations.map((c) => ({
    id: c.id,
    otherUser: c.participants.find((p) => p.userId !== session.user.id)?.user,
    lastMessage: c.messages[0] || null,
    updatedAt: c.updatedAt,
    unreadCount: unreadMap.get(c.id) || 0,
  }));
}

export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session) return [];

  // Verify participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) return [];

  return prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (!content.trim()) return { error: "Mensaje vacio" };

  // Verify participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) return { error: "No autorizado" };

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { success: true, message };
}

export async function startOrGetConversation(otherUserId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (otherUserId === session.user.id) return { error: "No puedes chatear contigo mismo" };

  // Find existing conversation between the two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
  });

  if (existing) return { conversationId: existing.id };

  // Require at least one booking between the two users before allowing chat
  const hasBooking = await prisma.booking.findFirst({
    where: {
      OR: [
        { clientId: session.user.id, providerId: otherUserId },
        { clientId: otherUserId, providerId: session.user.id },
      ],
      status: { notIn: ["CANCELLED"] },
    },
    select: { id: true },
  });

  if (!hasBooking) {
    return { error: "Debes tener una reserva activa con este usuario para iniciar un chat." };
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: session.user.id },
          { userId: otherUserId },
        ],
      },
    },
  });

  return { conversationId: conversation.id };
}

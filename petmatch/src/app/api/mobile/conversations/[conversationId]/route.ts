import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

// GET /api/mobile/conversations/:id — mensajes de la conversación
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { conversationId } = await params;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.id } },
  });
  if (!participant) return corsJson({ error: "No tienes acceso a esta conversación" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // message id for pagination

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Mark messages from others as READ
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.id },
      status: { not: "READ" },
    },
    data: { status: "READ" },
  });

  // Update lastReadAt
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: session.id } },
    data: { lastReadAt: new Date() },
  });

  return corsJson({ data: messages.reverse() });
}

// POST /api/mobile/conversations/:id — enviar mensaje
// Body: { content: string, type?: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { conversationId } = await params;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.id } },
  });
  if (!participant) return corsJson({ error: "No tienes acceso a esta conversación" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.content?.trim()) {
    return corsJson({ error: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  const { content, type = "TEXT" } = body as { content: string; type?: string };

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.id,
      content: content.trim(),
      type,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return corsJson({ data: message }, { status: 201 });
}

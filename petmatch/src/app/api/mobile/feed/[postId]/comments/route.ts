import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { postId } = await params;

  const comments = await prisma.feedComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return corsJson({ data: comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { postId } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.content?.trim()) return corsJson({ error: "Contenido requerido" }, { status: 400 });

  const post = await prisma.feedPost.findUnique({ where: { id: postId, status: "ACTIVE" } });
  if (!post) return corsJson({ error: "Post no encontrado" }, { status: 404 });

  const [comment] = await prisma.$transaction([
    prisma.feedComment.create({
      data: { postId, authorId: session.id, content: body.content.trim() },
      select: {
        id: true, content: true, createdAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.feedPost.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } }),
  ]);

  return corsJson({ data: comment }, { status: 201 });
}

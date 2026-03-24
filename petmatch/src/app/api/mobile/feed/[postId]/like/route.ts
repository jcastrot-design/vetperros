import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { postId } = await params;
  const post = await prisma.feedPost.findUnique({ where: { id: postId, status: "ACTIVE" } });
  if (!post) return corsJson({ error: "Post no encontrado" }, { status: 404 });

  const existing = await prisma.feedLike.findUnique({
    where: { postId_userId: { postId, userId: session.id } },
  });

  if (existing) {
    // Unlike
    await prisma.$transaction([
      prisma.feedLike.delete({ where: { postId_userId: { postId, userId: session.id } } }),
      prisma.feedPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
    ]);
    const updated = await prisma.feedPost.findUnique({ where: { id: postId }, select: { likesCount: true } });
    return corsJson({ data: { liked: false, likesCount: Math.max(0, updated?.likesCount ?? 0) } });
  } else {
    // Like
    await prisma.$transaction([
      prisma.feedLike.create({ data: { postId, userId: session.id } }),
      prisma.feedPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
    ]);
    const updated = await prisma.feedPost.findUnique({ where: { id: postId }, select: { likesCount: true } });
    return corsJson({ data: { liked: true, likesCount: updated?.likesCount ?? 1 } });
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() {
  return corsOptions();
}

// GET /api/mobile/feed?cursor=<postId>&limit=20
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  let cursorDate: Date | undefined;
  if (cursor) {
    const cursorPost = await prisma.feedPost.findUnique({ where: { id: cursor }, select: { createdAt: true } });
    if (cursorPost) cursorDate = cursorPost.createdAt;
  }

  const posts = await prisma.feedPost.findMany({
    where: {
      status: "ACTIVE",
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    select: {
      id: true,
      caption: true,
      mediaUrl: true,
      mediaType: true,
      thumbnailUrl: true,
      likesCount: true,
      commentsCount: true,
      createdAt: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
      pet: { select: { id: true, name: true, species: true } },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Check which posts current user liked
  const postIds = items.map(p => p.id);
  const myLikes = await prisma.feedLike.findMany({
    where: { userId: session.id, postId: { in: postIds } },
    select: { postId: true },
  });
  const likedSet = new Set(myLikes.map(l => l.postId));

  const data = items.map(p => ({ ...p, isLikedByMe: likedSet.has(p.id) }));

  return corsJson({ data: { posts: data, nextCursor } });
}

// POST /api/mobile/feed — create post
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.mediaData && !body?.mediaUrl)
    return corsJson({ error: "mediaData o mediaUrl requerido" }, { status: 400 });

  const { mediaData, mediaUrl, mediaType = "PHOTO", caption, petId } = body;

  if (!["PHOTO", "VIDEO"].includes(mediaType))
    return corsJson({ error: "mediaType inválido" }, { status: 400 });

  // Verify pet ownership if provided
  if (petId) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.ownerId !== session.id)
      return corsJson({ error: "Mascota no encontrada" }, { status: 404 });
  }

  // Create post first to get ID
  const post = await prisma.feedPost.create({
    data: {
      authorId: session.id,
      mediaUrl: mediaUrl ?? "", // temp, updated below if using mediaData
      mediaType,
      caption: caption?.trim() ?? null,
      petId: petId ?? null,
      mediaData: mediaData ?? null,
    },
  });

  // If using self-hosted storage, update mediaUrl to our serving endpoint
  const finalMediaUrl = mediaData
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://petmatch-ashy.vercel.app"}/api/mobile/feed/${post.id}/media`
    : mediaUrl;

  const updated = await prisma.feedPost.update({
    where: { id: post.id },
    data: { mediaUrl: finalMediaUrl },
    select: {
      id: true, mediaUrl: true, mediaType: true, caption: true,
      createdAt: true, likesCount: true, commentsCount: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
      pet: { select: { id: true, name: true, species: true } },
    },
  });

  return corsJson({ data: { ...updated, isLikedByMe: false } }, { status: 201 });
}

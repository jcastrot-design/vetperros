import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          city: true,
          reviewsReceived: {
            select: {
              id: true,
              rating: true,
              punctualityRating: true,
              careRating: true,
              communicationRating: true,
              comment: true,
              response: true,
              createdAt: true,
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          providerProfile: {
            select: {
              verificationStatus: true,
              trustScore: true,
              displayName: true,
              experience: true,
              totalServices: true,
              averageRating: true,
              responseTime: true,
            },
          },
        },
      },
      availability: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!service) return corsJson({ error: "Servicio no encontrado" }, { status: 404 });

  const reviews = service.provider.reviewsReceived;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return corsJson({
    data: {
      ...service,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    },
  });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

export function OPTIONS() { return corsOptions(); }

const createSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  punctualityRating: z.number().int().min(1).max(5).optional(),
  careRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: "Body inválido" }, { status: 400 });

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, clientId: session.id, status: "COMPLETED" },
  });
  if (!booking) return corsJson({ error: "Reserva no encontrada o no completada" }, { status: 404 });

  const existing = await prisma.review.findUnique({ where: { bookingId: parsed.data.bookingId } });
  if (existing) return corsJson({ error: "Ya existe una reseña para esta reserva" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      bookingId: parsed.data.bookingId,
      authorId: session.id,
      targetId: booking.providerId,
      rating: parsed.data.rating,
      punctualityRating: parsed.data.punctualityRating,
      careRating: parsed.data.careRating,
      communicationRating: parsed.data.communicationRating,
      comment: parsed.data.comment,
    },
  });

  return corsJson({ data: review }, { status: 201 });
}

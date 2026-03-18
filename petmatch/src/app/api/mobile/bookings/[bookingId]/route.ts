import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

export function OPTIONS() { return corsOptions(); }

const updateSchema = z.object({
  status: z.enum(["CANCELLED"]),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { bookingId } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.id },
    include: {
      service: {
        include: { provider: { select: { id: true, name: true, avatarUrl: true } } },
      },
      pet: true,
      payment: true,
      review: { select: { id: true, rating: true, comment: true, createdAt: true } },
    },
  });

  if (!booking) return corsJson({ error: "Reserva no encontrada" }, { status: 404 });
  return corsJson({ data: booking });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { bookingId } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson({ error: "Estado inválido" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.id },
  });
  if (!booking) return corsJson({ error: "Reserva no encontrada" }, { status: 404 });

  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return corsJson({ error: "No se puede cancelar esta reserva" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return corsJson({ data: updated });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

const createBookingSchema = z.object({
  serviceId: z.string(),
  petId: z.string(),
  startDate: z.string(),
  notes: z.string().optional(),
});

export function OPTIONS() {
  return corsOptions();
}

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      service: {
        select: { title: true, type: true, pricePerUnit: true, provider: { select: { name: true, avatarUrl: true } } },
      },
      pet: { select: { name: true, species: true, avatarUrl: true } },
    },
    orderBy: { startDate: "desc" },
    take: 50,
  });

  return corsJson({ data: bookings });
}

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: parsed.data.serviceId, isActive: true },
  });
  if (!service) return corsJson({ error: "Servicio no disponible" }, { status: 404 });

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, ownerId: session.id },
  });
  if (!pet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  const start = new Date(parsed.data.startDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora por defecto

  const booking = await prisma.booking.create({
    data: {
      clientId: session.id,
      providerId: service.providerId,
      serviceId: service.id,
      petId: pet.id,
      startDate: start,
      endDate: end,
      totalPrice: service.pricePerUnit,
      notes: parsed.data.notes,
    },
    include: {
      service: { select: { title: true, type: true } },
      pet: { select: { name: true } },
    },
  });

  return corsJson({ data: booking }, { status: 201 });
}

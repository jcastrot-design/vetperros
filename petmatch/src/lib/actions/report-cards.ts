"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const reportCardSchema = z.object({
  bookingId: z.string(),
  mood: z.enum(["HAPPY", "NORMAL", "ANXIOUS", "EXCITED"]),
  activities: z.string().default("[]"), // JSON array
  ateFood: z.boolean().default(false),
  drankWater: z.boolean().default(false),
  didPoop: z.boolean().default(false),
  didPee: z.boolean().default(false),
  notes: z.string().optional(),
  photos: z.string().default("[]"), // JSON array
});

export async function createReportCard(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = reportCardSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });

  if (!booking || booking.providerId !== session.user.id) {
    return { error: "Reserva no encontrada" };
  }

  const existing = await prisma.reportCard.findUnique({
    where: { bookingId: booking.id },
  });
  if (existing) return { error: "Ya existe un reporte para esta reserva" };

  await prisma.reportCard.create({
    data: {
      bookingId: booking.id,
      mood: parsed.data.mood,
      activities: parsed.data.activities,
      ateFood: parsed.data.ateFood,
      drankWater: parsed.data.drankWater,
      didPoop: parsed.data.didPoop,
      didPee: parsed.data.didPee,
      notes: parsed.data.notes,
      photos: parsed.data.photos,
    },
  });

  revalidatePath(`/dashboard/bookings/${booking.id}`);
  return { success: true };
}

export async function getReportCard(bookingId: string) {
  const session = await auth();
  if (!session) return null;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  if (booking.clientId !== session.user.id && booking.providerId !== session.user.id) {
    return null;
  }

  return prisma.reportCard.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: { provider: { select: { name: true, avatarUrl: true } } },
      },
    },
  });
}


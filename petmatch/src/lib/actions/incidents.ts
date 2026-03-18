"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const incidentSchema = z.object({
  bookingId: z.string(),
  category: z.enum(["PAYMENT", "SERVICE", "PROVIDER", "EMERGENCY"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(10, "Describe el problema con al menos 10 caracteres"),
});

export async function createIncident(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = incidentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });

  if (!booking) return { error: "Reserva no encontrada" };

  if (booking.clientId !== session.user.id && booking.providerId !== session.user.id) {
    return { error: "No autorizado" };
  }

  await prisma.incident.create({
    data: {
      bookingId: booking.id,
      reporterId: session.user.id,
      category: parsed.data.category,
      severity: parsed.data.severity,
      description: parsed.data.description,
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function resolveIncident(incidentId: string, resolution: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      status: "RESOLVED",
      resolvedBy: session.user.id,
      resolvedAt: new Date(),
      resolution,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function getIncidents() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  return prisma.incident.findMany({
    include: {
      booking: { include: { service: true, client: true, provider: true } },
      reporter: { select: { name: true, email: true } },
    },
    orderBy: [
      { status: "asc" }, // OPEN first
      { createdAt: "desc" },
    ],
  });
}

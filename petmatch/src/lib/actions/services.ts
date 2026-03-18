"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function createService(formData: unknown) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "WALKER" &&
      session.user.role !== "VET" &&
      session.user.role !== "ADMIN")
  ) {
    return { error: "No autorizado" };
  }

  const parsed = serviceSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // VET_HOME requires verified provider
  if (parsed.data.type === "VET_HOME") {
    if (session.user.role !== "VET" && session.user.role !== "ADMIN") {
      return { error: "Solo veterinarios pueden crear servicios a domicilio" };
    }
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile || profile.verificationStatus !== "VERIFIED") {
      return {
        error:
          "Debes estar verificado para publicar servicios veterinarios. Completa tu perfil y sube tu titulo profesional.",
      };
    }
  }

  await prisma.service.create({
    data: {
      ...parsed.data,
      providerId: session.user.id,
    },
  });

  revalidatePath("/provider/services");
  return { success: true };
}

export async function updateService(serviceId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.providerId !== session.user.id) {
    return { error: "Servicio no encontrado" };
  }

  const parsed = serviceSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: parsed.data,
  });

  revalidatePath("/provider/services");
  return { success: true };
}

export async function toggleServiceActive(serviceId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.providerId !== session.user.id) {
    return { error: "Servicio no encontrado" };
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: !service.isActive },
  });

  revalidatePath("/provider/services");
  revalidatePath(`/provider/services/${serviceId}`);
  return { success: true, isActive: !service.isActive };
}

export async function saveAvailability(
  serviceId: string,
  slots: { dayOfWeek: string; startTime: string; endTime: string }[],
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.providerId !== session.user.id) {
    return { error: "Servicio no encontrado" };
  }

  // Validate slots
  const validDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  for (const slot of slots) {
    if (!validDays.includes(slot.dayOfWeek)) {
      return { error: `Dia invalido: ${slot.dayOfWeek}` };
    }
    if (!/^\d{2}:\d{2}$/.test(slot.startTime) || !/^\d{2}:\d{2}$/.test(slot.endTime)) {
      return { error: "Formato de hora invalido. Use HH:MM" };
    }
    if (slot.startTime >= slot.endTime) {
      return { error: "La hora de inicio debe ser anterior a la hora de fin" };
    }
  }

  // Replace all availability for this service
  await prisma.$transaction([
    prisma.serviceAvailability.deleteMany({ where: { serviceId } }),
    ...slots.map((slot) =>
      prisma.serviceAvailability.create({
        data: { serviceId, ...slot },
      }),
    ),
  ]);

  revalidatePath("/provider/services");
  revalidatePath(`/provider/services/${serviceId}`);
  revalidatePath(`/services/${serviceId}`);
  return { success: true };
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";
import { refundPayment } from "@/lib/actions/payments";
import { z } from "zod/v4";
import { getServiceDiscount } from "@/lib/subscription-gates";
import { sendBookingCreatedEmail, sendBookingConfirmedEmail, sendCheckinEmail, sendCheckoutEmail } from "@/lib/email";

const PLATFORM_FEE_RATE = 0.15; // 15%
const SERVICE_FEE_RATE = 0.07; // 7% charged to client

const createBookingSchema = z.object({
  serviceId: z.string(),
  petId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
  recurrence: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
});

export async function createBooking(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = createBookingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const service = await prisma.service.findUnique({
    where: { id: parsed.data.serviceId },
  });
  if (!service) return { error: "Servicio no encontrado" };

  if (service.providerId === session.user.id) {
    return { error: "No puedes reservar tu propio servicio" };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  if (startDate >= endDate) {
    return { error: "La fecha de fin debe ser posterior a la de inicio" };
  }

  if (startDate < new Date()) {
    return { error: "No puedes reservar en el pasado" };
  }

  // Check for overlapping bookings
  const overlapping = await prisma.booking.findFirst({
    where: {
      providerId: service.providerId,
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (overlapping) {
    return { error: "El proveedor no esta disponible en ese horario" };
  }

  // Calculate pricing with subscription discount
  const hours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const discount = await getServiceDiscount(session.user.id);
  const rawSubtotal = service.pricePerUnit * hours;
  const subtotal = discount > 0
    ? Math.round(rawSubtotal * (1 - discount / 100))
    : rawSubtotal;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + serviceFee;
  const platformFee = Math.round(rawSubtotal * PLATFORM_FEE_RATE);
  const providerEarnings = rawSubtotal - platformFee;

  const recurrence = parsed.data.recurrence;

  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      clientId: session.user.id,
      providerId: service.providerId,
      startDate,
      endDate,
      totalPrice,
      serviceFee,
      platformFee,
      providerEarnings,
      notes: parsed.data.notes,
      isRecurring: !!recurrence,
      recurrence: recurrence || null,
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: booking.id,
      type: "CREATED",
      data: JSON.stringify({ userId: session.user.id, recurrence }),
    },
  });

  // Create future recurring bookings (next 4 occurrences)
  if (recurrence) {
    const intervalDays = recurrence === "WEEKLY" ? 7 : recurrence === "BIWEEKLY" ? 14 : 30;
    const durationMs = endDate.getTime() - startDate.getTime();

    for (let i = 1; i <= 4; i++) {
      const futureStart = new Date(startDate.getTime() + intervalDays * i * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + durationMs);

      await prisma.booking.create({
        data: {
          serviceId: service.id,
          clientId: session.user.id,
          providerId: service.providerId,
          startDate: futureStart,
          endDate: futureEnd,
          totalPrice,
          serviceFee,
          platformFee,
          providerEarnings,
          notes: parsed.data.notes,
          isRecurring: true,
          recurrence,
          parentBookingId: booking.id,
        },
      });
    }
  }

  // Ensure conversation exists between client and provider for chat
  const existingConvo = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: service.providerId } } },
      ],
    },
  });

  if (!existingConvo) {
    await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: service.providerId },
          ],
        },
      },
    });
  }

  // Notify provider
  await notify(
    service.providerId,
    "BOOKING",
    recurrence ? "Nueva reserva recurrente recibida" : "Nueva reserva recibida",
    `${session.user.name} ha reservado tu servicio "${service.title}"${recurrence ? ` (${recurrence === "WEEKLY" ? "semanal" : recurrence === "BIWEEKLY" ? "quincenal" : "mensual"})` : ""}`,
    `/provider/bookings`,
  );

  // Send email to provider (non-blocking)
  const provider = await prisma.user.findUnique({
    where: { id: service.providerId },
    select: { email: true, name: true },
  });
  if (provider?.email) {
    sendBookingCreatedEmail(
      provider.email,
      provider.name || "Proveedor",
      service.title,
      session.user.name || "Cliente",
      startDate.toLocaleDateString("es-CL"),
    ).catch(() => {});
  }

  revalidatePath("/dashboard/bookings");
  return { success: true, bookingId: booking.id };
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) return { error: "Reserva no encontrada" };

  const isProvider = booking.providerId === session.user.id;
  const isClient = booking.clientId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isProvider && !isClient && !isAdmin) {
    return { error: "No autorizado" };
  }

  if (isClient && status !== "CANCELLED") {
    return { error: "Solo puedes cancelar tu reserva" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking.id,
      type: status === "CANCELLED" ? "CANCELLED" : `STATUS_${status}`,
      data: JSON.stringify({ userId: session.user.id }),
    },
  });

  // When provider confirms, notify client to pay
  if (status === "CONFIRMED" && isProvider) {
    await notify(
      booking.clientId,
      "BOOKING",
      "Reserva aceptada — completa el pago",
      `El proveedor acepto tu reserva. Completa el pago para confirmarla.`,
      `/dashboard/bookings/${booking.id}`,
    );

    // Send confirmation email to client (non-blocking)
    const [client, service] = await Promise.all([
      prisma.user.findUnique({ where: { id: booking.clientId }, select: { email: true, name: true } }),
      prisma.service.findUnique({ where: { id: booking.serviceId }, select: { title: true } }),
    ]);
    if (client?.email) {
      sendBookingConfirmedEmail(
        client.email,
        client.name || "Cliente",
        service?.title || "Servicio",
        session.user.name || "Proveedor",
        booking.id,
      ).catch(() => {});
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath("/provider/bookings");
    return { success: true, requiresPayment: true };
  }

  // Notify the other party
  const statusMessages: Record<string, { title: string; body: string }> = {
    IN_PROGRESS: { title: "Servicio iniciado", body: "El proveedor ha comenzado el servicio" },
    COMPLETED: { title: "Servicio completado", body: "El servicio ha sido marcado como completado. Dejanos una resena!" },
  };

  const msg = statusMessages[status];
  if (msg) {
    const targetId = isProvider ? booking.clientId : booking.providerId;
    const link = isProvider ? "/dashboard/bookings" : "/provider/bookings";
    await notify(targetId, "BOOKING", msg.title, msg.body, link);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
  return { success: true };
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) return { error: "Reserva no encontrada" };

  const isProvider = booking.providerId === session.user.id;
  const isClient = booking.clientId === session.user.id;

  if (!isProvider && !isClient) {
    return { error: "No autorizado" };
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return { error: "Esta reserva ya fue completada o cancelada" };
  }

  // Calculate refund based on cancellation policy
  const hoursUntilStart = (new Date(booking.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
  let refundPercentage = 0;

  if (isProvider) {
    refundPercentage = 100;
  } else {
    if (hoursUntilStart > 48) {
      refundPercentage = 100;
    } else if (hoursUntilStart > 24) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason || (isProvider ? "Cancelado por proveedor" : "Cancelado por cliente"),
      cancelledBy: session.user.id,
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking.id,
      type: "CANCELLED",
      data: JSON.stringify({ userId: session.user.id, reason, refundPercentage, cancelledBy: isProvider ? "provider" : "client" }),
    },
  });

  // Process Stripe refund if payment exists
  if (refundPercentage > 0) {
    await refundPayment(bookingId, refundPercentage);
  }

  // Notify the other party
  const targetId = isProvider ? booking.clientId : booking.providerId;
  const cancelledByLabel = isProvider ? "el proveedor" : "el cliente";
  await notify(
    targetId,
    "BOOKING",
    "Reserva cancelada",
    `La reserva ha sido cancelada por ${cancelledByLabel}${refundPercentage > 0 ? `. Reembolso: ${refundPercentage}%` : ""}`,
    isProvider ? "/dashboard/bookings" : "/provider/bookings",
  );

  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
  return {
    success: true,
    refundPercentage,
    message: refundPercentage === 100
      ? "Cancelacion con reembolso completo"
      : refundPercentage === 50
        ? "Cancelacion con 50% de reembolso"
        : "Cancelacion sin reembolso (menos de 24h de anticipacion)",
  };
}

export async function calculateBookingPrice(serviceId: string, startDate: string, endDate: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  if (!service) return { error: "Servicio no encontrado" };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

  const subtotal = service.pricePerUnit * hours;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + serviceFee;

  return {
    subtotal,
    serviceFee,
    totalPrice,
    hours: Math.round(hours * 10) / 10,
    pricePerUnit: service.pricePerUnit,
  };
}

export async function checkinBooking(
  bookingId: string,
  lat: number | null,
  lng: number | null,
  photoUrl: string | null,
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking) return { error: "Reserva no encontrada" };
  if (booking.providerId !== session.user.id) return { error: "Solo el proveedor puede hacer check-in" };
  if (booking.status !== "CONFIRMED") return { error: "La reserva debe estar confirmada para hacer check-in" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "IN_PROGRESS",
      checkinAt: new Date(),
      checkinLat: lat,
      checkinLng: lng,
      checkinPhoto: photoUrl,
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId,
      type: "CHECKIN",
      data: JSON.stringify({ userId: session.user.id, lat, lng, photoUrl }),
    },
  });

  await notify(
    booking.clientId,
    "BOOKING",
    "El proveedor ha llegado",
    `${session.user.name} ha realizado el check-in para "${booking.service.title}"`,
    `/dashboard/bookings/${bookingId}`,
  );

  // Send email (non-blocking)
  const client = await prisma.user.findUnique({
    where: { id: booking.clientId },
    select: { email: true, name: true },
  });
  if (client?.email) {
    sendCheckinEmail(
      client.email,
      client.name || "Cliente",
      session.user.name || "Proveedor",
      booking.service.title,
    ).catch(() => {});
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
  return { success: true };
}

export async function checkoutBooking(
  bookingId: string,
  lat: number | null,
  lng: number | null,
  photoUrl: string | null,
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking) return { error: "Reserva no encontrada" };
  if (booking.providerId !== session.user.id) return { error: "Solo el proveedor puede hacer check-out" };
  if (booking.status !== "IN_PROGRESS") return { error: "El servicio debe estar en progreso para hacer check-out" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      checkoutAt: new Date(),
      checkoutLat: lat,
      checkoutLng: lng,
      checkoutPhoto: photoUrl,
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId,
      type: "CHECKOUT",
      data: JSON.stringify({ userId: session.user.id, lat, lng, photoUrl }),
    },
  });

  await notify(
    booking.clientId,
    "BOOKING",
    "Servicio finalizado",
    `${session.user.name} ha finalizado tu servicio "${booking.service.title}". Dejanos una resena!`,
    `/dashboard/bookings/${bookingId}`,
  );

  // Send email (non-blocking)
  const client = await prisma.user.findUnique({
    where: { id: booking.clientId },
    select: { email: true, name: true },
  });
  if (client?.email) {
    sendCheckoutEmail(
      client.email,
      client.name || "Cliente",
      session.user.name || "Proveedor",
      booking.service.title,
    ).catch(() => {});
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
  return { success: true };
}

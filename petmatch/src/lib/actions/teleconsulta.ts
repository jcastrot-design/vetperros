"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDailyRoom, createDailyToken } from "@/lib/daily";
import { revalidatePath } from "next/cache";

export async function joinTeleconsultaRoom(bookingId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { type: true, title: true } },
      provider: { select: { name: true } },
      client: { select: { name: true } },
    },
  });

  if (!booking) return { error: "Consulta no encontrada" };

  const isProvider = booking.providerId === session.user.id;
  const isClient = booking.clientId === session.user.id;

  if (!isProvider && !isClient) return { error: "No autorizado" };
  if (booking.service.type !== "TELECONSULTA") return { error: "Esta reserva no es una teleconsulta" };
  if (!["CONFIRMED", "IN_PROGRESS"].includes(booking.status)) {
    return { error: "La consulta debe estar confirmada para unirse" };
  }

  let roomName = booking.teleconsultaRoomName;
  let roomUrl = booking.teleconsultaRoomUrl;

  // Create room if it doesn't exist
  if (!roomName || !roomUrl) {
    try {
      const room = await createDailyRoom(bookingId, booking.endDate);
      roomName = room.name;
      roomUrl = room.url;
      await prisma.booking.update({
        where: { id: bookingId },
        data: { teleconsultaRoomName: roomName, teleconsultaRoomUrl: roomUrl },
      });
      revalidatePath(`/teleconsulta/${bookingId}`);
    } catch (err) {
      console.error("Daily.co room creation failed:", err);
      return { error: "No se pudo crear la sala de videollamada. Verifica la configuración." };
    }
  }

  // Generate participant token
  try {
    const token = await createDailyToken(
      roomName!,
      session.user.id,
      (isProvider ? booking.provider.name : booking.client.name) ?? "Participante",
      isProvider,
      booking.endDate,
    );
    return { roomUrl, token };
  } catch (err) {
    console.error("Daily.co token creation failed:", err);
    return { error: "No se pudo generar el token de acceso." };
  }
}

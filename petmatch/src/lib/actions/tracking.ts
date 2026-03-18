"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function startTracking(bookingId: string, lat: number, lng: number) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.providerId !== session.user.id) {
    return { error: "Reserva no encontrada" };
  }

  if (booking.status !== "IN_PROGRESS") {
    return { error: "El servicio debe estar en curso para iniciar tracking" };
  }

  const tracking = await prisma.walkTracking.create({
    data: {
      bookingId,
      coordinates: JSON.stringify([{ lat, lng, timestamp: Date.now() }]),
      startLocation: JSON.stringify({ lat, lng }),
      isActive: true,
    },
  });

  return { success: true, trackingId: tracking.id };
}

export async function updateTracking(trackingId: string, lat: number, lng: number) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const tracking = await prisma.walkTracking.findUnique({
    where: { id: trackingId },
    include: { booking: true },
  });

  if (!tracking || tracking.booking.providerId !== session.user.id) {
    return { error: "Tracking no encontrado" };
  }

  const coords = JSON.parse(tracking.coordinates || "[]");
  coords.push({ lat, lng, timestamp: Date.now() });

  const distance = calculateTotalDistance(coords);

  await prisma.walkTracking.update({
    where: { id: trackingId },
    data: {
      coordinates: JSON.stringify(coords),
      totalDistance: distance * 1000, // convert km to meters
    },
  });

  return { success: true, distance };
}

export async function endTracking(trackingId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const tracking = await prisma.walkTracking.findUnique({
    where: { id: trackingId },
    include: { booking: true },
  });

  if (!tracking || tracking.booking.providerId !== session.user.id) {
    return { error: "Tracking no encontrado" };
  }

  const coords = JSON.parse(tracking.coordinates || "[]");
  const distance = calculateTotalDistance(coords);
  const durationSec = Math.round((Date.now() - new Date(tracking.createdAt).getTime()) / 1000);

  const lastCoord = coords.length > 0 ? coords[coords.length - 1] : null;

  await prisma.walkTracking.update({
    where: { id: trackingId },
    data: {
      isActive: false,
      totalDistance: distance * 1000, // meters
      totalDuration: durationSec,
      endLocation: lastCoord ? JSON.stringify({ lat: lastCoord.lat, lng: lastCoord.lng }) : null,
    },
  });

  return { success: true, distance, durationSec };
}

export async function getTrackingData(bookingId: string) {
  const session = await auth();
  if (!session) return null;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  if (booking.clientId !== session.user.id && booking.providerId !== session.user.id) {
    return null;
  }

  return prisma.walkTracking.findFirst({
    where: { bookingId },
    orderBy: { createdAt: "desc" },
  });
}

// Haversine distance calculation
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateTotalDistance(coords: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(
      coords[i - 1].lat, coords[i - 1].lng,
      coords[i].lat, coords[i].lng,
    );
  }
  return Math.round(total * 100) / 100;
}

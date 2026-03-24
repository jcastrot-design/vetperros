import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const userId = session.id;

  const [
    petCount,
    bookingCount,
    pets,
    activeBookings,
    recentBookings,
    reminders,
  ] = await Promise.all([
    prisma.pet.count({ where: { ownerId: userId } }),
    prisma.booking.count({ where: { clientId: userId } }),
    prisma.pet.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, species: true, breed: true },
    }),
    prisma.booking.findMany({
      where: { clientId: userId, status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      include: { service: { select: { title: true, type: true, provider: { select: { name: true } } } } },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
    prisma.booking.findMany({
      where: { clientId: userId },
      include: { service: { select: { title: true, type: true, provider: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.reminder.findMany({
      where: {
        userId,
        status: { in: ["PENDING", "SENT"] },
      },
      include: { pet: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return corsJson({
    data: {
      stats: { pets: petCount, bookings: bookingCount },
      pets,
      activeBookings,
      recentBookings,
      reminders,
    },
  });
}

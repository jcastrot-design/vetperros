import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      availability: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Get upcoming booked slots for this provider (next 30 days)
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const bookedSlots = await prisma.booking.findMany({
    where: {
      providerId: service.providerId,
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      startDate: { gte: now },
      endDate: { lte: thirtyDaysLater },
    },
    select: {
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    ...service,
    bookedSlots: bookedSlots.map((b) => ({
      start: b.startDate.toISOString(),
      end: b.endDate.toISOString(),
    })),
  });
}

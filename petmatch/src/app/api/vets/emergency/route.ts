import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clinics = await prisma.vetClinic.findMany({
    where: {
      OR: [
        { phone: { not: null } },
        { is24h: true },
      ],
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      is24h: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clinics);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";

export async function GET(req: Request) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

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
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clinics);
}

import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobile/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [lostPets, adoptions] = await Promise.all([
    prisma.lostPet.findMany({
      where: { status: { in: ["LOST", "FOUND"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        species: true,
        status: true,
        city: true,
        description: true,
        photos: true,
        createdAt: true,
        owner: { select: { name: true } },
      },
    }),
    prisma.adoptionPost.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        description: true,
        adoptionFee: true,
        city: true,
        isUrgent: true,
        createdAt: true,
        poster: { select: { name: true } },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photos: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ data: { lostPets, adoptions } });
}

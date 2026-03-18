import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, species: true, breed: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(pets);
}

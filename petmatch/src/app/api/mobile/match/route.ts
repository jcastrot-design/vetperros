import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() {
  return corsOptions();
}

// GET: fetch swipe feed for a pet
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");

  if (!petId) return corsJson({ error: "petId requerido" }, { status: 400 });

  // Verify ownership
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== session.id)
    return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  // Get already swiped pet IDs
  const swiped = await prisma.swipe.findMany({
    where: { petId },
    select: { targetPetId: true },
  });

  const excludeIds = [petId, ...swiped.map((s) => s.targetPetId)];

  const feed = await prisma.pet.findMany({
    where: {
      id: { notIn: excludeIds },
      ownerId: { not: session.id },
      isActive: true,
    },
    include: {
      owner: { select: { name: true, city: true } },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return corsJson({ data: feed });
}

// POST: record a swipe
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.petId || !body?.targetPetId || !body?.action)
    return corsJson({ error: "Datos incompletos" }, { status: 400 });

  const { petId, targetPetId, action } = body;
  if (!["LIKE", "PASS"].includes(action))
    return corsJson({ error: "Acción inválida" }, { status: 400 });

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== session.id)
    return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  const targetPet = await prisma.pet.findUnique({ where: { id: targetPetId } });
  if (!targetPet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  await prisma.swipe.upsert({
    where: { petId_targetPetId: { petId, targetPetId } },
    create: {
      senderId: session.id,
      receiverId: targetPet.ownerId,
      petId,
      targetPetId,
      action,
    },
    update: { action },
  });

  let isMatch = false;
  if (action === "LIKE") {
    const reverse = await prisma.swipe.findFirst({
      where: { petId: targetPetId, targetPetId: petId, action: "LIKE" },
    });
    if (reverse) {
      isMatch = true;
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.id } } },
            { participants: { some: { userId: targetPet.ownerId } } },
          ],
        },
      });
      if (!existing) {
        await prisma.conversation.create({
          data: {
            participants: {
              create: [{ userId: session.id }, { userId: targetPet.ownerId }],
            },
          },
        });
      }
    }
  }

  return corsJson({ data: { isMatch } });
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";

export async function createLostPet(data: {
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  description?: string;
  lastSeenAt: string;
  lastSeenAddress?: string;
  lastSeenLat?: number;
  lastSeenLng?: number;
  city?: string;
  reward?: number;
  isUrgent: boolean;
}) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (!data.name?.trim()) return { error: "El nombre es obligatorio" };
  if (!["DOG", "CAT", "OTHER"].includes(data.species)) return { error: "Especie inválida" };

  const lostPet = await prisma.lostPet.create({
    data: {
      userId: session.user.id,
      name: data.name.trim(),
      species: data.species,
      breed: data.breed?.trim() || null,
      color: data.color?.trim() || null,
      size: data.size || null,
      description: data.description?.trim() || null,
      lastSeenAt: new Date(data.lastSeenAt),
      lastSeenAddress: data.lastSeenAddress?.trim() || null,
      lastSeenLat: data.lastSeenLat || null,
      lastSeenLng: data.lastSeenLng || null,
      city: data.city?.trim() || null,
      reward: data.reward || null,
      isUrgent: data.isUrgent,
      status: "LOST",
    },
  });

  revalidatePath("/lost-pets");
  return { success: true, id: lostPet.id };
}

export async function reportSighting(data: {
  lostPetId: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
}) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const lostPet = await prisma.lostPet.findUnique({
    where: { id: data.lostPetId },
    select: { id: true, userId: true, name: true, status: true },
  });

  if (!lostPet) return { error: "Publicación no encontrada" };
  if (lostPet.status === "REUNITED") return { error: "Esta mascota ya fue encontrada" };
  if (lostPet.userId === session.user.id) return { error: "No puedes reportar avistamiento de tu propia mascota" };

  await prisma.lostPetSighting.create({
    data: {
      lostPetId: data.lostPetId,
      reporterId: session.user.id,
      description: data.description?.trim() || null,
      address: data.address?.trim() || null,
      lat: data.lat || null,
      lng: data.lng || null,
    },
  });

  await notify(
    lostPet.userId,
    "SYSTEM",
    `¡Avistaron a ${lostPet.name}!`,
    `Alguien reportó haber visto a ${lostPet.name}. Revisa los detalles.`,
    `/lost-pets/${lostPet.id}`,
  );

  revalidatePath(`/lost-pets/${data.lostPetId}`);
  return { success: true };
}

export async function updateLostPetStatus(id: string, status: "LOST" | "FOUND" | "REUNITED") {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const lostPet = await prisma.lostPet.findUnique({ where: { id } });
  if (!lostPet || lostPet.userId !== session.user.id) return { error: "No autorizado" };

  await prisma.lostPet.update({ where: { id }, data: { status } });

  revalidatePath(`/lost-pets/${id}`);
  revalidatePath("/lost-pets");
  return { success: true };
}

export async function getMyLostPets() {
  const session = await auth();
  if (!session) return [];

  return prisma.lostPet.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { sightings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

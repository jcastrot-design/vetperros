"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(targetId: string, type: "SERVICE" | "PROVIDER") {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (type === "SERVICE") {
    const existing = await prisma.favorite.findFirst({
      where: { userId: session.user.id, serviceId: targetId },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard/favorites");
      return { success: true, isFavorite: false };
    }
    await prisma.favorite.create({
      data: { userId: session.user.id, serviceId: targetId },
    });
  } else {
    const existing = await prisma.favorite.findFirst({
      where: { userId: session.user.id, providerId: targetId },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard/favorites");
      return { success: true, isFavorite: false };
    }
    await prisma.favorite.create({
      data: { userId: session.user.id, providerId: targetId },
    });
  }

  revalidatePath("/dashboard/favorites");
  return { success: true, isFavorite: true };
}

export async function getFavorites() {
  const session = await auth();
  if (!session) return [];

  return prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function isFavorite(targetId: string, type: "SERVICE" | "PROVIDER") {
  const session = await auth();
  if (!session) return false;

  const fav = await prisma.favorite.findFirst({
    where: type === "SERVICE"
      ? { userId: session.user.id, serviceId: targetId }
      : { userId: session.user.id, providerId: targetId },
  });

  return !!fav;
}

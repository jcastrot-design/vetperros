"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkDailySwipeLimit } from "@/lib/subscription-gates";

export async function createSwipe(
  petId: string,
  targetPetId: string,
  action: "LIKE" | "PASS",
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  // Check daily swipe limit (FREE: 5/day, PREMIUM/PRO: unlimited)
  const swipeCheck = await checkDailySwipeLimit(session.user.id);
  if (!swipeCheck.allowed) {
    return {
      error: `Has alcanzado tu limite diario de ${swipeCheck.limit} matches. Mejora a Premium para swipes ilimitados.`,
      limitReached: true,
      remaining: 0,
    };
  }

  // Verify ownership
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== session.user.id) {
    return { error: "Mascota no encontrada" };
  }

  const targetPet = await prisma.pet.findUnique({ where: { id: targetPetId } });
  if (!targetPet) {
    return { error: "Mascota objetivo no encontrada" };
  }

  // Create swipe
  await prisma.swipe.upsert({
    where: { petId_targetPetId: { petId, targetPetId } },
    create: {
      senderId: session.user.id,
      receiverId: targetPet.ownerId,
      petId,
      targetPetId,
      action,
    },
    update: { action },
  });

  // Check for mutual like (match)
  if (action === "LIKE") {
    const reverseSwipe = await prisma.swipe.findFirst({
      where: {
        petId: targetPetId,
        targetPetId: petId,
        action: "LIKE",
      },
    });

    if (reverseSwipe) {
      // Check if conversation already exists
      const existingConvo = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: targetPet.ownerId } } },
          ],
        },
      });

      if (!existingConvo) {
        await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: session.user.id },
                { userId: targetPet.ownerId },
              ],
            },
          },
        });
      }

      revalidatePath("/match/matches");
      return { success: true, isMatch: true, remaining: swipeCheck.remaining - 1 };
    }
  }

  return { success: true, isMatch: false, remaining: swipeCheck.remaining - 1 };
}

export async function getSwipeFeed(petId: string) {
  const session = await auth();
  if (!session) return [];

  // Get IDs of pets already swiped
  const swipedPetIds = await prisma.swipe.findMany({
    where: { petId },
    select: { targetPetId: true },
  });

  const excludeIds = [petId, ...swipedPetIds.map((s) => s.targetPetId)];

  // Get pets not yet swiped, excluding own pets
  const pets = await prisma.pet.findMany({
    where: {
      id: { notIn: excludeIds },
      ownerId: { not: session.user.id },
    },
    include: { owner: { select: { name: true, city: true } } },
    take: 20,
  });

  return pets;
}

export async function getMatches() {
  const session = await auth();
  if (!session) return [];

  const userPets = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  // Find mutual likes
  const myLikes = await prisma.swipe.findMany({
    where: {
      petId: { in: userPetIds },
      action: "LIKE",
    },
    select: { targetPetId: true, petId: true },
  });

  const mutualMatches = [];

  for (const like of myLikes) {
    const reverse = await prisma.swipe.findFirst({
      where: {
        petId: like.targetPetId,
        targetPetId: like.petId,
        action: "LIKE",
      },
    });

    if (reverse) {
      const matchedPet = await prisma.pet.findUnique({
        where: { id: like.targetPetId },
        include: { owner: { select: { id: true, name: true, avatarUrl: true, city: true } } },
      });
      if (matchedPet) {
        mutualMatches.push(matchedPet);
      }
    }
  }

  return mutualMatches;
}

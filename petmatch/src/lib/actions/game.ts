"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TIERS = [
  { minScore: 1000, discount: 15 },
  { minScore: 500,  discount: 10 },
  { minScore: 200,  discount: 5  },
];

function generateCode(discount: number): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PERRO${discount}-${rand}`;
}

export async function submitGameScore(score: number) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const roundedScore = Math.floor(score);

  // Save score
  await prisma.gameScore.create({
    data: { userId: session.user.id, score: roundedScore },
  });

  // Check if score qualifies for a coupon
  const tier = TIERS.find((t) => roundedScore >= t.minScore);
  if (!tier) return { score: roundedScore, coupon: null };

  // Limit: 1 coupon per day per user
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCoupon = await prisma.coupon.findFirst({
    where: { userId: session.user.id, createdAt: { gte: startOfDay } },
  });

  if (todayCoupon) {
    return { score: roundedScore, coupon: null, alreadyEarned: true, existingCode: todayCoupon.code };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const coupon = await prisma.coupon.create({
    data: {
      code: generateCode(tier.discount),
      userId: session.user.id,
      discount: tier.discount,
      minScore: tier.minScore,
      expiresAt,
    },
  });

  return { score: roundedScore, coupon: { code: coupon.code, discount: coupon.discount } };
}

export async function validateCoupon(code: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon) return { error: "Cupón no válido" };
  if (coupon.usedAt) return { error: "Este cupón ya fue utilizado" };
  if (coupon.expiresAt < new Date()) return { error: "Este cupón ha expirado" };
  if (coupon.userId !== session.user.id) return { error: "Este cupón no te pertenece" };

  return { discount: coupon.discount, code: coupon.code };
}

export async function getMyCoupons() {
  const session = await auth();
  if (!session) return [];

  return prisma.coupon.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyTopScore() {
  const session = await auth();
  if (!session) return 0;

  const top = await prisma.gameScore.findFirst({
    where: { userId: session.user.id },
    orderBy: { score: "desc" },
    select: { score: true },
  });
  return top?.score ?? 0;
}

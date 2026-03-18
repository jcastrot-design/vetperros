"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { randomBytes } from "crypto";

export async function getMyReferralCode() {
  const session = await auth();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  // Generate a unique code
  const code = randomBytes(4).toString("hex").toUpperCase();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
  });

  return code;
}

export async function getReferralStats() {
  const session = await auth();
  if (!session) return { total: 0, completed: 0, rewarded: 0 };

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
  });

  return {
    total: referrals.length,
    completed: referrals.filter((r) => r.status === "COMPLETED").length,
    rewarded: referrals.filter((r) => r.rewardGiven).length,
  };
}

export async function getReferralHistory() {
  const session = await auth();
  if (!session) return [];

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (referrals.length === 0) return [];

  const referredUserIds = referrals.map((r) => r.referredId);

  const users = await prisma.user.findMany({
    where: { id: { in: referredUserIds } },
    select: { id: true, name: true, avatarUrl: true, createdAt: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return referrals.map((r) => {
    const user = userMap.get(r.referredId);
    return {
      id: r.id,
      name: user?.name ?? "Usuario",
      avatarUrl: user?.avatarUrl ?? null,
      joinedAt: user?.createdAt?.toISOString() ?? r.createdAt.toISOString(),
      status: r.status,
    };
  });
}

export async function applyReferralCode(code: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  // Check if user already used a referral
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referredBy: true },
  });

  if (user?.referredBy) {
    return { error: "Ya usaste un codigo de referido" };
  }

  // Find referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
  });

  if (!referrer) {
    return { error: "Codigo de referido invalido" };
  }

  if (referrer.id === session.user.id) {
    return { error: "No puedes usar tu propio codigo" };
  }

  // Apply referral
  await prisma.user.update({
    where: { id: session.user.id },
    data: { referredBy: referrer.id },
  });

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: session.user.id,
      status: "COMPLETED",
    },
  });

  // Notify referrer
  await notify(
    referrer.id,
    "SYSTEM",
    "Nuevo referido!",
    `${session.user.name} se unio con tu codigo de referido`,
    "/dashboard/referrals",
  );

  return { success: true };
}

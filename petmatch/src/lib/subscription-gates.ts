import { prisma } from "@/lib/prisma";

type PlanKey = "FREE" | "PREMIUM" | "PRO";

const LIMITS: Record<PlanKey, {
  maxPets: number;
  petMatch: boolean;
  liveTracking: boolean;
  reminders: boolean;
  serviceDiscount: number;
  marketplace: boolean;
  dailySwipes: number;
}> = {
  FREE: {
    maxPets: 2,
    petMatch: true,
    liveTracking: false,
    reminders: false,
    serviceDiscount: 0,
    marketplace: true,
    dailySwipes: 5,
  },
  PREMIUM: {
    maxPets: Infinity,
    petMatch: true,
    liveTracking: false,
    reminders: true,
    serviceDiscount: 10,
    marketplace: true,
    dailySwipes: Infinity,
  },
  PRO: {
    maxPets: Infinity,
    petMatch: true,
    liveTracking: true,
    reminders: true,
    serviceDiscount: 20,
    marketplace: true,
    dailySwipes: Infinity,
  },
};

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!sub || sub.status !== "ACTIVE") return "FREE";
  return (sub.plan as PlanKey) || "FREE";
}

export function getPlanLimits(plan: PlanKey) {
  return LIMITS[plan] || LIMITS.FREE;
}

export async function checkPetLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number;
  plan: PlanKey;
}> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  const current = await prisma.pet.count({ where: { ownerId: userId } });

  return {
    allowed: current < limits.maxPets,
    current,
    max: limits.maxPets,
    plan,
  };
}

export async function checkFeatureAccess(
  userId: string,
  feature: "petMatch" | "liveTracking" | "reminders",
): Promise<{ allowed: boolean; plan: PlanKey }> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  return {
    allowed: limits[feature],
    plan,
  };
}

export async function checkDailySwipeLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: PlanKey;
}> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.dailySwipes === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity, plan };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.swipe.count({
    where: {
      senderId: userId,
      createdAt: { gte: todayStart },
    },
  });

  const remaining = Math.max(0, limits.dailySwipes - todayCount);

  return {
    allowed: todayCount < limits.dailySwipes,
    remaining,
    limit: limits.dailySwipes,
    plan,
  };
}

export async function getServiceDiscount(userId: string): Promise<number> {
  const plan = await getUserPlan(userId);
  return getPlanLimits(plan).serviceDiscount;
}

import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobile/auth";
import { prisma } from "@/lib/prisma";

const TIERS = [
  { minScore: 1000, discount: 15 },
  { minScore: 500,  discount: 10 },
  { minScore: 200,  discount: 5  },
];

function generateCode(discount: number): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PERRO${discount}-${rand}`;
}

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [topScore, coupons] = await Promise.all([
    prisma.gameScore.findFirst({
      where: { userId: session.id },
      orderBy: { score: "desc" },
      select: { score: true },
    }),
    prisma.coupon.findMany({
      where: { userId: session.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { code: true, discount: true, expiresAt: true },
    }),
  ]);

  return NextResponse.json({ topScore: topScore?.score ?? 0, coupons });
}

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { score } = await req.json();
  const roundedScore = Math.floor(score);

  await prisma.gameScore.create({ data: { userId: session.id, score: roundedScore } });

  const tier = TIERS.find((t) => roundedScore >= t.minScore);
  if (!tier) return NextResponse.json({ score: roundedScore, coupon: null });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCoupon = await prisma.coupon.findFirst({
    where: { userId: session.id, createdAt: { gte: startOfDay } },
  });

  if (todayCoupon) {
    return NextResponse.json({ score: roundedScore, coupon: null, alreadyEarned: true, existingCode: todayCoupon.code });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const coupon = await prisma.coupon.create({
    data: {
      code: generateCode(tier.discount),
      userId: session.id,
      discount: tier.discount,
      minScore: tier.minScore,
      expiresAt,
    },
  });

  return NextResponse.json({ score: roundedScore, coupon: { code: coupon.code, discount: coupon.discount } });
}

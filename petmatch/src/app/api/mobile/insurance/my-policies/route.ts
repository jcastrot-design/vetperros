import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobile/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const policies = await prisma.insurancePolicy.findMany({
    where: { userId: session.id },
    include: {
      plan: { select: { name: true, providerName: true, coverages: true } },
      pet:  { select: { name: true, species: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const parsed = policies.map((p) => ({
    ...p,
    plan: {
      ...p.plan,
      coverages: JSON.parse(p.plan.coverages ?? "[]"),
    },
  }));

  return NextResponse.json({ data: parsed });
}

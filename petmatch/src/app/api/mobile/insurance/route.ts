import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobile/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await getMobileSession(req); // público pero autentica si hay token

  const plans = await prisma.insurancePlan.findMany({
    where: { approvalStatus: "APPROVED", isActive: true },
    select: {
      id:           true,
      name:         true,
      description:  true,
      providerName: true,
      price:        true,
      annualPrice:  true,
      currency:     true,
      coverages:    true,
      petSpecies:   true,
      maxAgeMonths: true,
      deductible:   true,
      maxCoverage:  true,
    },
    orderBy: { price: "asc" },
  });

  const parsed = plans.map((p) => ({
    ...p,
    coverages:  JSON.parse(p.coverages  ?? "[]"),
    petSpecies: JSON.parse(p.petSpecies ?? "[]"),
  }));

  return NextResponse.json({ data: parsed });
}

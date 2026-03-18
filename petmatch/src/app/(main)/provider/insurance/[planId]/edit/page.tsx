import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlanForm } from "../../plan-form";

export default async function EditInsurancePlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "INSURANCE_PROVIDER") redirect("/dashboard");

  const { planId } = await params;
  const plan = await prisma.insurancePlan.findFirst({
    where: { id: planId, providerId: session.user.id },
  });
  if (!plan) notFound();

  const coverages: string[]  = JSON.parse(plan.coverages ?? "[]");
  const petSpecies: string[] = JSON.parse(plan.petSpecies ?? "[]");

  return (
    <PlanForm
      planId={plan.id}
      defaultValues={{
        name:         plan.name,
        description:  plan.description,
        price:        plan.price,
        annualPrice:  plan.annualPrice ?? undefined,
        coverages,
        petSpecies,
        maxAgeMonths: plan.maxAgeMonths ?? undefined,
        deductible:   plan.deductible   ?? undefined,
        maxCoverage:  plan.maxCoverage  ?? undefined,
      }}
    />
  );
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";
import { z } from "zod/v4";
import type { Prisma } from "@/generated/prisma/client";

export type InsurancePolicyWithRelations = Prisma.InsurancePolicyGetPayload<{
  include: {
    plan: { select: { name: true; providerName: true; coverages: true } };
    pet:  { select: { name: true; species: true } };
  };
}>;

const planSchema = z.object({
  name:           z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description:    z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  price:          z.number().min(1000, "El precio mínimo es $1.000 CLP"),
  annualPrice:    z.number().optional(),
  coverages:      z.array(z.string().min(1)).min(1, "Agrega al menos una cobertura"),
  petSpecies:     z.array(z.enum(["DOG", "CAT", "BIRD", "RABBIT"])).min(1, "Selecciona al menos una especie"),
  maxAgeMonths:   z.number().min(1).optional(),
  deductible:     z.number().min(0).optional(),
  maxCoverage:    z.number().min(0).optional(),
});

// ─── PROVIDER ACTIONS ───────────────────────────────

export async function createInsurancePlan(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };
  if (session.user.role !== "INSURANCE_PROVIDER") return { error: "Solo proveedores de seguros pueden crear planes" };

  const parsed = planSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const provider = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  await prisma.insurancePlan.create({
    data: {
      ...parsed.data,
      coverages:   JSON.stringify(parsed.data.coverages),
      petSpecies:  JSON.stringify(parsed.data.petSpecies),
      providerId:  session.user.id,
      providerName: provider!.name,
      approvalStatus: "PENDING_REVIEW",
    },
  });

  revalidatePath("/provider/insurance");
  return { success: true };
}

export async function updateInsurancePlan(planId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const plan = await prisma.insurancePlan.findUnique({ where: { id: planId } });
  if (!plan || plan.providerId !== session.user.id) return { error: "Plan no encontrado" };

  const parsed = planSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.insurancePlan.update({
    where: { id: planId },
    data: {
      ...parsed.data,
      coverages:     JSON.stringify(parsed.data.coverages),
      petSpecies:    JSON.stringify(parsed.data.petSpecies),
      approvalStatus: "PENDING_REVIEW", // vuelve a revisión al editar
    },
  });

  revalidatePath("/provider/insurance");
  return { success: true };
}

export async function toggleInsurancePlan(planId: string, isActive: boolean) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const plan = await prisma.insurancePlan.findUnique({ where: { id: planId } });
  if (!plan || plan.providerId !== session.user.id) return { error: "Plan no encontrado" };

  await prisma.insurancePlan.update({ where: { id: planId }, data: { isActive } });
  revalidatePath("/provider/insurance");
  return { success: true };
}

export async function deleteInsurancePlan(planId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const plan = await prisma.insurancePlan.findUnique({
    where: { id: planId },
    include: { _count: { select: { policies: { where: { status: "ACTIVE" } } } } },
  });
  if (!plan || plan.providerId !== session.user.id) return { error: "Plan no encontrado" };
  if (plan._count.policies > 0) return { error: "No puedes eliminar un plan con pólizas activas" };

  await prisma.insurancePlan.delete({ where: { id: planId } });
  revalidatePath("/provider/insurance");
  return { success: true };
}

export async function getMyInsurancePlans() {
  const session = await auth();
  if (!session) return [];

  return prisma.insurancePlan.findMany({
    where: { providerId: session.user.id },
    include: {
      _count: { select: { policies: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyInsuranceMetrics() {
  const session = await auth();
  if (!session) return null;

  const [planCount, activePolicies, earnings] = await Promise.all([
    prisma.insurancePlan.count({ where: { providerId: session.user.id } }),
    prisma.insurancePolicy.count({
      where: { plan: { providerId: session.user.id }, status: "ACTIVE" },
    }),
    prisma.insurancePolicyPayment.aggregate({
      where: {
        policy: { plan: { providerId: session.user.id } },
        status: "SUCCEEDED",
      },
      _sum: { providerEarnings: true },
    }),
  ]);

  return {
    planCount,
    activePolicies,
    totalEarnings: earnings._sum.providerEarnings ?? 0,
  };
}

// ─── ADMIN ACTIONS ──────────────────────────────────

export async function approveInsurancePlan(planId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const plan = await prisma.insurancePlan.findUnique({
    where: { id: planId },
    select: { providerId: true, name: true },
  });
  if (!plan) return { error: "Plan no encontrado" };

  await prisma.insurancePlan.update({
    where: { id: planId },
    data: { approvalStatus: "APPROVED", approvedAt: new Date(), rejectionReason: null },
  });

  await notify(
    plan.providerId, "SYSTEM",
    "Plan aprobado ✅",
    `Tu plan de seguro "${plan.name}" fue aprobado y ya está visible en el marketplace.`,
    "/provider/insurance",
  );

  revalidatePath("/admin/insurance");
  revalidatePath("/services");
  return { success: true };
}

export async function rejectInsurancePlan(planId: string, reason: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const plan = await prisma.insurancePlan.findUnique({
    where: { id: planId },
    select: { providerId: true, name: true },
  });
  if (!plan) return { error: "Plan no encontrado" };

  await prisma.insurancePlan.update({
    where: { id: planId },
    data: { approvalStatus: "REJECTED", rejectionReason: reason || "No cumple los requisitos" },
  });

  await notify(
    plan.providerId, "SYSTEM",
    "Plan rechazado",
    `Tu plan "${plan.name}" fue rechazado: ${reason || "No cumple los requisitos"}.`,
    "/provider/insurance",
  );

  revalidatePath("/admin/insurance");
  return { success: true };
}

// ─── USER ACTIONS ───────────────────────────────────

export async function getApprovedInsurancePlans() {
  return prisma.insurancePlan.findMany({
    where: { approvalStatus: "APPROVED", isActive: true },
    orderBy: { price: "asc" },
  });
}

export async function getMyInsurancePolicies(): Promise<InsurancePolicyWithRelations[]> {
  const session = await auth();
  if (!session) return [];

  return prisma.insurancePolicy.findMany({
    where: { userId: session.user.id },
    include: {
      plan: { select: { name: true, providerName: true, coverages: true } },
      pet:  { select: { name: true, species: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelInsurancePolicy(policyId: string, reason?: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const policy = await prisma.insurancePolicy.findUnique({ where: { id: policyId } });
  if (!policy || policy.userId !== session.user.id) return { error: "Póliza no encontrada" };
  if (policy.status !== "ACTIVE") return { error: "Solo puedes cancelar pólizas activas" };

  await prisma.insurancePolicy.update({
    where: { id: policyId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason ?? "Cancelado por el usuario", autoRenew: false },
  });

  revalidatePath("/dashboard/insurance");
  return { success: true };
}

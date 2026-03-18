"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { providerProfileSchema, providerDocumentSchema } from "@/lib/validations/provider";
import { revalidatePath } from "next/cache";

// ─── PROVIDER PROFILE ──────────────────────────────────────

export async function createProviderProfile(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };
  if (session.user.role !== "WALKER" && session.user.role !== "VET" && session.user.role !== "ADMIN") {
    return { error: "Solo proveedores pueden crear un perfil" };
  }

  const existing = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) return { error: "Ya tienes un perfil de proveedor" };

  const parsed = providerProfileSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const profile = await prisma.providerProfile.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      verificationStatus: "PENDING",
    },
  });

  revalidatePath("/provider");
  return { success: true, profileId: profile.id };
}

export async function updateProviderProfile(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { error: "Perfil no encontrado" };

  const parsed = providerProfileSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.providerProfile.update({
    where: { id: profile.id },
    data: parsed.data,
  });

  revalidatePath("/provider");
  return { success: true };
}

export async function getProviderProfile(userId?: string) {
  const session = await auth();
  if (!session) return null;

  const targetId = userId || session.user.id;
  return prisma.providerProfile.findUnique({
    where: { userId: targetId },
    include: {
      badges: true,
      documents: true,
      user: {
        select: { name: true, email: true, avatarUrl: true, city: true, createdAt: true },
      },
    },
  });
}

// ─── PROVIDER DOCUMENTS ────────────────────────────────────

export async function uploadProviderDocument(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { error: "Primero crea tu perfil de proveedor" };

  const parsed = providerDocumentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.providerDocument.create({
    data: {
      providerId: profile.id,
      type: parsed.data.type,
      fileUrl: parsed.data.fileUrl,
      status: "PENDING",
    },
  });

  // If this is the first document, mark profile as pending verification
  if (profile.verificationStatus === "NONE") {
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: "PENDING" },
    });
  }

  revalidatePath("/provider");
  return { success: true };
}

export async function getProviderDocuments() {
  const session = await auth();
  if (!session) return [];

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return [];

  return prisma.providerDocument.findMany({
    where: { providerId: profile.id },
    orderBy: { uploadedAt: "desc" },
  });
}

// ─── ADMIN: VERIFICATION ───────────────────────────────────

export async function verifyProvider(profileId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return { error: "Perfil no encontrado" };

  await prisma.providerProfile.update({
    where: { id: profileId },
    data: {
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  // Add IDENTITY_VERIFIED badge if not exists
  const existingBadge = await prisma.providerBadge.findFirst({
    where: { providerId: profileId, type: "IDENTITY_VERIFIED" },
  });
  if (!existingBadge) {
    await prisma.providerBadge.create({
      data: { providerId: profileId, type: "IDENTITY_VERIFIED" },
    });
  }

  revalidatePath("/admin/providers");
  return { success: true };
}

export async function rejectProvider(profileId: string, notes?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.providerProfile.update({
    where: { id: profileId },
    data: { verificationStatus: "REJECTED" },
  });

  // Update all pending documents as rejected
  await prisma.providerDocument.updateMany({
    where: { providerId: profileId, status: "PENDING" },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      notes: notes || "Perfil rechazado por administracion",
    },
  });

  revalidatePath("/admin/providers");
  return { success: true };
}

export async function approveDocument(documentId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.providerDocument.update({
    where: { id: documentId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    },
  });

  revalidatePath("/admin/providers");
  return { success: true };
}

export async function rejectDocument(documentId: string, notes?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.providerDocument.update({
    where: { id: documentId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      notes,
    },
  });

  revalidatePath("/admin/providers");
  return { success: true };
}

export async function addBadge(profileId: string, type: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const existing = await prisma.providerBadge.findFirst({
    where: { providerId: profileId, type },
  });
  if (existing) return { error: "El proveedor ya tiene este badge" };

  await prisma.providerBadge.create({
    data: { providerId: profileId, type },
  });

  revalidatePath("/admin/providers");
  return { success: true };
}

export async function removeBadge(badgeId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.providerBadge.delete({ where: { id: badgeId } });

  revalidatePath("/admin/providers");
  return { success: true };
}

// ─── TRUST SCORE ───────────────────────────────────────────

export async function recalculateTrustScore(userId: string) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { badges: true },
  });
  if (!profile) return;

  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    select: { rating: true },
  });

  const completedServices = await prisma.booking.count({
    where: { providerId: userId, status: "COMPLETED" },
  });

  // Weighted trust score calculation
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingScore = (avgRating / 5) * 40; // 40% weight
  const servicesScore = Math.min(completedServices / 50, 1) * 20; // 20% weight, max at 50 services
  const verificationScore = profile.verificationStatus === "VERIFIED" ? 20 : 0; // 20% weight
  const badgeCount = profile.badges.length;
  const badgeScore = Math.min(badgeCount / 4, 1) * 10; // 10% weight, max at 4 badges

  // Account age (10% weight)
  const monthsActive = (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
  const ageScore = Math.min(monthsActive / 12, 1) * 10; // max at 12 months

  const trustScore = Math.round(ratingScore + servicesScore + verificationScore + badgeScore + ageScore);

  await prisma.providerProfile.update({
    where: { id: profile.id },
    data: {
      trustScore,
      totalServices: completedServices,
      averageRating: Math.round(avgRating * 10) / 10,
    },
  });

  return trustScore;
}

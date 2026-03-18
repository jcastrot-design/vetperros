"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

export async function toggleBanUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado" };

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function resolveReport(reportId: string) {
  await requireAdmin();

  await prisma.report.update({
    where: { id: reportId },
    data: { isResolved: true },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: string,
) {
  await prisma.notification.create({
    data: { userId, type, title, body, data },
  });
}

export async function getNotifications() {
  const session = await auth();
  if (!session) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

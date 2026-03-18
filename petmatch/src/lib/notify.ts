import { prisma } from "@/lib/prisma";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string,
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: link ? JSON.stringify({ link }) : undefined,
    },
  });

  // Emit real-time notification via Socket.IO server
  try {
    await fetch(`${SOCKET_URL}/emit-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        notification: {
          id: notification.id,
          type,
          title,
          body,
          data: notification.data,
          isRead: false,
          createdAt: notification.createdAt,
        },
      }),
    });
  } catch {
    // Socket server may not be running — fail silently
  }
}

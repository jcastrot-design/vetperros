import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { sendReminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Protect with a secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find reminders that are PENDING and due within their notifyBefore window
  const reminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      dueDate: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }, // max 30 days ahead
    },
    include: {
      user: { select: { email: true, name: true } },
      pet: { select: { name: true } },
    },
  });

  let sent = 0;

  for (const reminder of reminders) {
    const daysUntilDue = Math.ceil(
      (reminder.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only notify if within the notifyBefore window
    if (daysUntilDue > reminder.notifyBefore) continue;

    // Create in-app notification
    await notify(
      reminder.userId,
      "REMINDER",
      `Recordatorio: ${reminder.title}`,
      `${reminder.pet.name} tiene ${reminder.title} el ${reminder.dueDate.toLocaleDateString("es-CL")}`,
      "/dashboard/reminders",
    );

    // Send email
    if (reminder.user.email) {
      await sendReminderEmail(
        reminder.user.email,
        reminder.user.name || "Usuario",
        reminder.title,
        reminder.pet.name,
        reminder.dueDate.toLocaleDateString("es-CL"),
      ).catch(() => {});
    }

    // Mark as sent
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: "SENT" },
    });

    sent++;
  }

  return NextResponse.json({ processed: reminders.length, sent });
}

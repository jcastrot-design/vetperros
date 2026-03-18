import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

export function OPTIONS() { return corsOptions(); }

const patchSchema = z.object({
  status: z.enum(["COMPLETED", "DISMISSED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { reminderId } = await params;
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: session.id },
  });
  if (!reminder) return corsJson({ error: "Recordatorio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return corsJson({ error: "Estado inválido" }, { status: 400 });

  const updated = await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: parsed.data.status },
  });

  return corsJson({ data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { reminderId } = await params;
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: session.id },
  });
  if (!reminder) return corsJson({ error: "Recordatorio no encontrado" }, { status: 404 });

  await prisma.reminder.delete({ where: { id: reminderId } });
  return corsJson({ success: true });
}

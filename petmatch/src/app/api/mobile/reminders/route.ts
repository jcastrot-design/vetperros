import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.id },
    include: { pet: { select: { id: true, name: true, species: true } } },
    orderBy: { dueDate: "asc" },
  });

  return corsJson({ data: reminders });
}

const createSchema = z.object({
  petId: z.string(),
  type: z.enum(["VACCINE", "DEWORMING", "MEDICATION", "GROOMING", "CHECKUP", "CUSTOM"]),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "BIANNUAL", "ANNUAL"]).default("NONE"),
  notifyBefore: z.number().default(3),
});

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: "Body inválido" }, { status: 400 });

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });

  const pet = await prisma.pet.findFirst({ where: { id: parsed.data.petId, ownerId: session.id } });
  if (!pet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  const reminder = await prisma.reminder.create({
    data: {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate),
      userId: session.id,
    },
    include: { pet: { select: { id: true, name: true, species: true } } },
  });

  return corsJson({ data: reminder }, { status: 201 });
}

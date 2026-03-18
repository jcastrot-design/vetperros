import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: Promise<{ petId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { petId } = await params;
  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.id },
    include: {
      vaccines: { orderBy: { dateAdministered: "desc" } },
      medications: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      medicalVisits: { orderBy: { visitDate: "desc" } },
      reminders: {
        where: { status: { in: ["PENDING", "SENT"] } },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!pet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });
  return corsJson({ data: pet });
}

const updatePetSchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  age: z.number().optional(),
  weight: z.number().optional(),
  isVaccinated: z.boolean().optional(),
  isNeutered: z.boolean().optional(),
  microchipId: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  temperament: z.string().optional(),
  diet: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ petId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { petId } = await params;
  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: session.id } });
  if (!pet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: "Body inválido" }, { status: 400 });

  const parsed = updatePetSchema.safeParse(body);
  if (!parsed.success) return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });

  const { dateOfBirth, ...rest } = parsed.data;
  const updated = await prisma.pet.update({
    where: { id: petId },
    data: {
      ...rest,
      ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
    },
  });

  return corsJson({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ petId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { petId } = await params;
  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: session.id } });
  if (!pet) return corsJson({ error: "Mascota no encontrada" }, { status: 404 });

  await prisma.pet.delete({ where: { id: petId } });
  return corsJson({ success: true });
}

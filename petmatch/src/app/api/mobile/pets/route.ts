import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";
import { z } from "zod/v4";

const createPetSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).default("MEDIUM"),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  age: z.number().optional(),
  weight: z.number().optional(),
  isVaccinated: z.boolean().default(false),
  isNeutered: z.boolean().default(false),
  microchipId: z.string().optional(),
  allergies: z.string().default("[]"),
  medicalConditions: z.string().default("[]"),
  temperament: z.string().default("[]"),
  diet: z.string().optional(),
  description: z.string().optional(),
});

export function OPTIONS() {
  return corsOptions();
}

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.id, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      vaccines: { orderBy: { dateAdministered: "desc" }, take: 1 },
      medications: { where: { isActive: true } },
    },
  });

  return corsJson({ data: pets });
}

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: "Body inválido" }, { status: 400 });

  const parsed = createPetSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { sex, dateOfBirth, ...rest } = parsed.data;

  const pet = await prisma.pet.create({
    data: {
      ...rest,
      sex: sex ?? undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      ownerId: session.id,
    },
  });

  return corsJson({ data: pet }, { status: 201 });
}

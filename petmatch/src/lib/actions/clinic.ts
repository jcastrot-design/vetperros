"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const clinicProfileSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  is24h: z.boolean().default(false),
  openingHours: z.string().optional(), // JSON string
  services: z.array(z.string()).optional(),
});

export async function upsertClinicProfile(data: z.infer<typeof clinicProfileSchema>) {
  const session = await auth();
  if (!session || session.user.role !== "CLINIC") return { error: "No autorizado" };

  const parsed = clinicProfileSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  const { services, ...rest } = parsed.data;

  await prisma.vetClinic.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...rest,
      services: JSON.stringify(services ?? []),
      website: rest.website || null,
    },
    update: {
      ...rest,
      services: JSON.stringify(services ?? []),
      website: rest.website || null,
    },
  });

  revalidatePath("/clinic");
  revalidatePath("/clinic/profile");
  return { success: true };
}

export async function verifyClinic(clinicId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.vetClinic.update({
    where: { id: clinicId },
    data: { isVerified: true },
  });

  revalidatePath("/admin/clinics");
  return { success: true };
}

export async function unverifyClinic(clinicId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.vetClinic.update({
    where: { id: clinicId },
    data: { isVerified: false },
  });

  revalidatePath("/admin/clinics");
  return { success: true };
}

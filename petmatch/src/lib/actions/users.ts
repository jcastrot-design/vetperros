"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export async function updateProfile(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = profileSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

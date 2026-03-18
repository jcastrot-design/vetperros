"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  petSchema,
  vaccineSchema,
  medicationSchema,
  documentSchema,
  reminderSchema,
} from "@/lib/validations/pet";
import { revalidatePath } from "next/cache";
import { checkPetLimit } from "@/lib/subscription-gates";

// ─── Helpers ──────────────────────────────────────────

function calculateProfileCompletion(pet: {
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  dateOfBirth?: Date | null;
  size: string;
  weight?: number | null;
  isVaccinated: boolean;
  isNeutered: boolean;
  microchipId?: string | null;
  description?: string | null;
  photos: string;
  diet?: string | null;
}): number {
  let score = 0;
  const total = 12;
  if (pet.name) score++;
  if (pet.species) score++;
  if (pet.breed) score++;
  if (pet.sex) score++;
  if (pet.dateOfBirth) score++;
  if (pet.size) score++;
  if (pet.weight) score++;
  if (pet.isVaccinated || pet.isNeutered) score++;
  if (pet.microchipId) score++;
  if (pet.description) score++;
  if (pet.photos !== "[]") score++;
  if (pet.diet) score++;
  return Math.round((score / total) * 100);
}

async function verifyPetOwnership(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== userId) return null;
  return pet;
}

// ─── Pet CRUD ─────────────────────────────────────────

export async function createPet(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  // Check subscription pet limit
  const petLimit = await checkPetLimit(session.user.id);
  if (!petLimit.allowed) {
    return {
      error: `Tu plan ${petLimit.plan} permite hasta ${petLimit.max} mascotas. Mejora tu suscripcion para agregar mas.`,
    };
  }

  const parsed = petSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = {
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
    ownerId: session.user.id,
    profileCompletion: 0,
  };

  const pet = await prisma.pet.create({ data });

  // Calculate profile completion
  const completion = calculateProfileCompletion(pet);
  await prisma.pet.update({
    where: { id: pet.id },
    data: { profileCompletion: completion },
  });

  revalidatePath("/dashboard/pets");
  return { success: true, petId: pet.id };
}

export async function updatePet(petId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const pet = await verifyPetOwnership(petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  const parsed = petSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const updated = await prisma.pet.update({
    where: { id: petId },
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
    },
  });

  // Recalculate profile completion
  const completion = calculateProfileCompletion(updated);
  if (completion !== updated.profileCompletion) {
    await prisma.pet.update({
      where: { id: petId },
      data: { profileCompletion: completion },
    });
  }

  revalidatePath("/dashboard/pets");
  return { success: true };
}

export async function deletePet(petId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const pet = await verifyPetOwnership(petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.pet.delete({ where: { id: petId } });

  revalidatePath("/dashboard/pets");
  return { success: true };
}

// ─── Vaccines ─────────────────────────────────────────

export async function addVaccine(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = vaccineSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.petVaccine.create({
    data: {
      petId: parsed.data.petId,
      name: parsed.data.name,
      dateAdministered: new Date(parsed.data.dateAdministered),
      nextDueDate: parsed.data.nextDueDate ? new Date(parsed.data.nextDueDate) : undefined,
      veterinarian: parsed.data.veterinarian,
      notes: parsed.data.notes,
    },
  });

  // Auto-create reminder if nextDueDate is set
  if (parsed.data.nextDueDate) {
    await prisma.reminder.create({
      data: {
        userId: session.user.id,
        petId: parsed.data.petId,
        type: "VACCINE",
        title: `Vacuna ${parsed.data.name} - ${pet.name}`,
        description: `Refuerzo de vacuna ${parsed.data.name}`,
        dueDate: new Date(parsed.data.nextDueDate),
        recurrence: "ANNUAL",
        notifyBefore: 7,
      },
    });
  }

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  return { success: true };
}

export async function updateVaccine(vaccineId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = vaccineSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  const vaccine = await prisma.petVaccine.findUnique({ where: { id: vaccineId } });
  if (!vaccine || vaccine.petId !== parsed.data.petId) {
    return { error: "Vacuna no encontrada" };
  }

  await prisma.petVaccine.update({
    where: { id: vaccineId },
    data: {
      name: parsed.data.name,
      dateAdministered: new Date(parsed.data.dateAdministered),
      nextDueDate: parsed.data.nextDueDate ? new Date(parsed.data.nextDueDate) : null,
      veterinarian: parsed.data.veterinarian,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  return { success: true };
}

export async function deleteVaccine(vaccineId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const vaccine = await prisma.petVaccine.findUnique({
    where: { id: vaccineId },
    include: { pet: true },
  });
  if (!vaccine || vaccine.pet.ownerId !== session.user.id) {
    return { error: "Vacuna no encontrada" };
  }

  await prisma.petVaccine.delete({ where: { id: vaccineId } });

  revalidatePath(`/dashboard/pets/${vaccine.petId}`);
  return { success: true };
}

// ─── Medications ──────────────────────────────────────

export async function addMedication(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = medicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.petMedication.create({
    data: {
      petId: parsed.data.petId,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      isActive: parsed.data.isActive,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  return { success: true };
}

export async function updateMedication(medicationId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = medicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  const medication = await prisma.petMedication.findUnique({ where: { id: medicationId } });
  if (!medication || medication.petId !== parsed.data.petId) {
    return { error: "Medicamento no encontrado" };
  }

  await prisma.petMedication.update({
    where: { id: medicationId },
    data: {
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      isActive: parsed.data.isActive,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  return { success: true };
}

export async function deleteMedication(medicationId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const medication = await prisma.petMedication.findUnique({
    where: { id: medicationId },
    include: { pet: true },
  });
  if (!medication || medication.pet.ownerId !== session.user.id) {
    return { error: "Medicamento no encontrado" };
  }

  await prisma.petMedication.delete({ where: { id: medicationId } });

  revalidatePath(`/dashboard/pets/${medication.petId}`);
  return { success: true };
}

// ─── Documents ────────────────────────────────────────

export async function addDocument(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = documentSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.petDocument.create({
    data: {
      petId: parsed.data.petId,
      type: parsed.data.type,
      title: parsed.data.title,
      fileUrl: parsed.data.fileUrl,
    },
  });

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const document = await prisma.petDocument.findUnique({
    where: { id: documentId },
    include: { pet: true },
  });
  if (!document || document.pet.ownerId !== session.user.id) {
    return { error: "Documento no encontrado" };
  }

  await prisma.petDocument.delete({ where: { id: documentId } });

  revalidatePath(`/dashboard/pets/${document.petId}`);
  return { success: true };
}

// ─── Reminders ────────────────────────────────────────

export async function addReminder(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = reminderSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const pet = await verifyPetOwnership(parsed.data.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.reminder.create({
    data: {
      userId: session.user.id,
      petId: parsed.data.petId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      recurrence: parsed.data.recurrence,
      notifyBefore: parsed.data.notifyBefore,
    },
  });

  revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeReminder(reminderId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!reminder || reminder.userId !== session.user.id) {
    return { error: "Recordatorio no encontrado" };
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function dismissReminder(reminderId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!reminder || reminder.userId !== session.user.id) {
    return { error: "Recordatorio no encontrado" };
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteReminder(reminderId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!reminder || reminder.userId !== session.user.id) {
    return { error: "Recordatorio no encontrado" };
  }

  await prisma.reminder.delete({ where: { id: reminderId } });

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Medical Visits ──────────────────────────────────

export async function addMedicalVisit(formData: {
  petId: string;
  type: string;
  title: string;
  description?: string;
  veterinarian?: string;
  clinic?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  visitDate: string;
  nextVisit?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const pet = await verifyPetOwnership(formData.petId, session.user.id);
  if (!pet) return { error: "Mascota no encontrada" };

  await prisma.medicalVisit.create({
    data: {
      petId: formData.petId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      veterinarian: formData.veterinarian,
      clinic: formData.clinic,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      cost: formData.cost,
      visitDate: new Date(formData.visitDate),
      nextVisit: formData.nextVisit ? new Date(formData.nextVisit) : undefined,
      notes: formData.notes,
    },
  });

  revalidatePath(`/dashboard/pets/${formData.petId}`);
  return { success: true };
}

export async function deleteMedicalVisit(visitId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const visit = await prisma.medicalVisit.findUnique({
    where: { id: visitId },
    include: { pet: true },
  });
  if (!visit || visit.pet.ownerId !== session.user.id) {
    return { error: "Visita no encontrada" };
  }

  await prisma.medicalVisit.delete({ where: { id: visitId } });

  revalidatePath(`/dashboard/pets/${visit.petId}`);
  return { success: true };
}

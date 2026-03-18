"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adoptionPostSchema, adoptionApplicationSchema } from "@/lib/validations/adoption";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";

// ─── POSTS ───────────────────────────────────────────

export async function createRescuedAdoptionPost(data: {
  // Pet data
  petName: string;
  species: string;
  breed?: string;
  size?: string;
  approximateAge?: string; // "puppy" | "young" | "adult" | "senior"
  isVaccinated: boolean;
  isNeutered: boolean;
  // Post data
  reason: string;
  description?: string;
  city?: string;
  adoptionFee: number;
  isUrgent: boolean;
  isFosterOnly: boolean;
  requirements: string;
}) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (!data.petName?.trim()) return { error: "El nombre de la mascota es obligatorio" };
  if (!["DOG", "CAT"].includes(data.species)) return { error: "Especie inválida" };

  // Calculate approximate DOB from age category
  let dateOfBirth: Date | undefined;
  const now = new Date();
  if (data.approximateAge === "puppy") {
    dateOfBirth = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  } else if (data.approximateAge === "young") {
    dateOfBirth = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  } else if (data.approximateAge === "adult") {
    dateOfBirth = new Date(now.getFullYear() - 4, now.getMonth(), 1);
  } else if (data.approximateAge === "senior") {
    dateOfBirth = new Date(now.getFullYear() - 9, now.getMonth(), 1);
  }

  // Create the pet record
  const pet = await prisma.pet.create({
    data: {
      name: data.petName.trim(),
      species: data.species,
      breed: data.breed?.trim() || null,
      size: data.size || null,
      dateOfBirth: dateOfBirth || null,
      isVaccinated: data.isVaccinated,
      isNeutered: data.isNeutered,
      photos: "[]",
      ownerId: session.user.id,
    },
  });

  // Create the adoption post
  const post = await prisma.adoptionPost.create({
    data: {
      petId: pet.id,
      posterId: session.user.id,
      reason: data.reason || "OTHER",
      description: data.description?.trim() || null,
      city: data.city?.trim() || null,
      adoptionFee: data.adoptionFee || 0,
      isUrgent: data.isUrgent,
      isFosterOnly: data.isFosterOnly,
      requirements: data.requirements || "[]",
      status: "ACTIVE",
    },
  });

  revalidatePath("/adoption");
  revalidatePath("/adoption/my-posts");
  return { success: true, postId: post.id };
}

export async function createAdoptionPost(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = adoptionPostSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Verify the user owns the pet
  const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
  if (!pet || pet.ownerId !== session.user.id) return { error: "Mascota no encontrada" };

  // Check no active post exists for this pet
  const existing = await prisma.adoptionPost.findUnique({ where: { petId: parsed.data.petId } });
  if (existing) return { error: "Esta mascota ya tiene una publicación de adopción activa" };

  const post = await prisma.adoptionPost.create({
    data: {
      ...parsed.data,
      posterId: session.user.id,
      city: parsed.data.city || pet.owner?.city || undefined,
    },
  });

  revalidatePath("/adoption");
  revalidatePath("/adoption/my-posts");
  return { success: true, postId: post.id };
}

export async function updateAdoptionPost(postId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const post = await prisma.adoptionPost.findUnique({ where: { id: postId } });
  if (!post || post.posterId !== session.user.id) return { error: "Publicación no encontrada" };

  const parsed = adoptionPostSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.adoptionPost.update({
    where: { id: postId },
    data: {
      reason: parsed.data.reason,
      adoptionFee: parsed.data.adoptionFee,
      city: parsed.data.city,
      isUrgent: parsed.data.isUrgent,
      isFosterOnly: parsed.data.isFosterOnly,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
    },
  });

  revalidatePath(`/adoption/${postId}`);
  revalidatePath("/adoption/my-posts");
  return { success: true };
}

export async function deleteAdoptionPost(postId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const post = await prisma.adoptionPost.findUnique({ where: { id: postId } });
  if (!post || (post.posterId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Publicación no encontrada" };
  }

  await prisma.adoptionPost.delete({ where: { id: postId } });

  revalidatePath("/adoption");
  revalidatePath("/adoption/my-posts");
  return { success: true };
}

export async function updatePostStatus(postId: string, status: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const post = await prisma.adoptionPost.findUnique({
    where: { id: postId },
    include: { applications: { where: { status: "PENDING" }, select: { applicantId: true } } },
  });

  if (!post || (post.posterId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Publicación no encontrada" };
  }

  const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "ADOPTED", "CANCELLED"];
  if (!validStatuses.includes(status)) return { error: "Estado inválido" };

  await prisma.adoptionPost.update({
    where: { id: postId },
    data: {
      status,
      ...(status === "ADOPTED" ? { adoptedAt: new Date() } : {}),
    },
  });

  // Notify all pending applicants when pet is adopted
  if (status === "ADOPTED" || status === "CANCELLED") {
    const pet = await prisma.pet.findUnique({ where: { id: post.petId }, select: { name: true } });
    for (const app of post.applications) {
      await notify(
        app.applicantId,
        "ADOPTION",
        status === "ADOPTED" ? `${pet?.name} ya encontró hogar` : "Publicación cancelada",
        status === "ADOPTED"
          ? `Lamentablemente ${pet?.name} ya fue adoptado/a por otro solicitante.`
          : "La publicación de adopción fue cancelada por el dueño.",
        "/adoption/applications",
      );
    }
  }

  revalidatePath(`/adoption/${postId}`);
  revalidatePath("/adoption/my-posts");
  revalidatePath("/adoption");
  return { success: true };
}

// ─── QUERIES ─────────────────────────────────────────

export async function getAdoptionPosts(filters?: {
  species?: string;
  size?: string;
  city?: string;
  isUrgent?: boolean;
  isFosterOnly?: boolean;
  q?: string;
}) {
  return prisma.adoptionPost.findMany({
    where: {
      status: "ACTIVE",
      ...(filters?.isUrgent ? { isUrgent: true } : {}),
      ...(filters?.isFosterOnly ? { isFosterOnly: true } : {}),
      ...(filters?.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
      pet: {
        ...(filters?.species ? { species: filters.species } : {}),
        ...(filters?.size ? { size: filters.size } : {}),
        ...(filters?.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" } },
                { breed: { contains: filters.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    },
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          size: true,
          dateOfBirth: true,
          isVaccinated: true,
          isNeutered: true,
          photos: true,
        },
      },
      poster: { select: { name: true, avatarUrl: true, city: true } },
      _count: { select: { applications: true } },
    },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    take: 60,
  });
}

export async function getAdoptionPost(postId: string) {
  const post = await prisma.adoptionPost.findUnique({
    where: { id: postId },
    include: {
      pet: true,
      poster: { select: { id: true, name: true, avatarUrl: true, city: true, createdAt: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!post) return null;

  // Increment view count (fire and forget)
  prisma.adoptionPost
    .update({ where: { id: postId }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return post;
}

export async function getMyAdoptionPosts() {
  const session = await auth();
  if (!session) return [];

  return prisma.adoptionPost.findMany({
    where: { posterId: session.user.id },
    include: {
      pet: { select: { name: true, species: true, breed: true, photos: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostApplications(postId: string) {
  const session = await auth();
  if (!session) return [];

  const post = await prisma.adoptionPost.findUnique({ where: { id: postId } });
  if (!post || (post.posterId !== session.user.id && session.user.role !== "ADMIN")) return [];

  return prisma.adoptionApplication.findMany({
    where: { postId },
    include: {
      applicant: { select: { id: true, name: true, avatarUrl: true, city: true, createdAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMyApplications() {
  const session = await auth();
  if (!session) return [];

  return prisma.adoptionApplication.findMany({
    where: { applicantId: session.user.id },
    include: {
      post: {
        include: {
          pet: { select: { name: true, species: true, breed: true, photos: true } },
          poster: { select: { name: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── APPLICATIONS ─────────────────────────────────────

export async function applyToAdopt(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = adoptionApplicationSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const post = await prisma.adoptionPost.findUnique({
    where: { id: parsed.data.postId },
    include: { pet: { select: { name: true } } },
  });

  if (!post || post.status !== "ACTIVE") return { error: "Publicación no disponible" };
  if (post.posterId === session.user.id) return { error: "No puedes solicitar adoptar tu propia mascota" };

  // Check duplicate
  const existing = await prisma.adoptionApplication.findUnique({
    where: { postId_applicantId: { postId: parsed.data.postId, applicantId: session.user.id } },
  });
  if (existing) return { error: "Ya enviaste una solicitud para esta mascota" };

  await prisma.adoptionApplication.create({
    data: { ...parsed.data, applicantId: session.user.id },
  });

  // Notify poster
  const applicantName = session.user.name || "Alguien";
  await notify(
    post.posterId,
    "ADOPTION",
    `Nueva solicitud para ${post.pet.name}`,
    `${applicantName} quiere adoptar a ${post.pet.name}. Revisa su solicitud.`,
    `/adoption/my-posts/${post.id}`,
  );

  revalidatePath("/adoption/applications");
  revalidatePath(`/adoption/${parsed.data.postId}`);
  return { success: true };
}

export async function withdrawApplication(applicationId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const app = await prisma.adoptionApplication.findUnique({ where: { id: applicationId } });
  if (!app || app.applicantId !== session.user.id) return { error: "Solicitud no encontrada" };
  if (app.status !== "PENDING") return { error: "Solo puedes retirar solicitudes pendientes" };

  await prisma.adoptionApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });

  revalidatePath("/adoption/applications");
  return { success: true };
}

export async function reviewApplication(
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string,
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    include: { post: { include: { pet: { select: { name: true } } } } },
  });

  if (!app) return { error: "Solicitud no encontrada" };
  if (app.post.posterId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  let conversationId: string | undefined;

  if (status === "APPROVED") {
    // Create or get conversation between poster and applicant
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: app.applicantId } } },
        ],
      },
    });

    if (existing) {
      conversationId = existing.id;
    } else {
      const convo = await prisma.conversation.create({
        data: {
          type: "BOOKING", // reutilizamos el sistema de chat existente
          participants: {
            create: [{ userId: session.user.id }, { userId: app.applicantId }],
          },
        },
      });
      conversationId = convo.id;
    }

    await notify(
      app.applicantId,
      "ADOPTION",
      `¡Tu solicitud fue aprobada! 🐾`,
      `El dueño de ${app.post.pet.name} aprobó tu solicitud. Puedes chatear con él ahora.`,
      `/chat/${conversationId}`,
    );
  } else {
    await notify(
      app.applicantId,
      "ADOPTION",
      `Solicitud no seleccionada`,
      `Lamentablemente tu solicitud para ${app.post.pet.name} no fue seleccionada esta vez.`,
      "/adoption/applications",
    );
  }

  await prisma.adoptionApplication.update({
    where: { id: applicationId },
    data: {
      status,
      reviewedAt: new Date(),
      reviewNotes: notes,
      ...(conversationId ? { conversationId } : {}),
    },
  });

  revalidatePath(`/adoption/my-posts/${app.postId}`);
  return { success: true, conversationId };
}

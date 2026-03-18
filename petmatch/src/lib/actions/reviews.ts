"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";
import { recalculateTrustScore } from "./providers";
import { z } from "zod/v4";

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  punctualityRating: z.number().int().min(1).max(5).optional(),
  careRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  photos: z.string().default("[]"), // JSON array of URLs
});

export async function createReview(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });

  if (!booking || booking.clientId !== session.user.id) {
    return { error: "Reserva no encontrada" };
  }

  if (booking.status !== "COMPLETED") {
    return { error: "Solo puedes resenar reservas completadas" };
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });

  if (existingReview) {
    return { error: "Ya dejaste una resena para esta reserva" };
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      authorId: session.user.id,
      targetId: booking.providerId,
      rating: parsed.data.rating,
      punctualityRating: parsed.data.punctualityRating,
      careRating: parsed.data.careRating,
      communicationRating: parsed.data.communicationRating,
      comment: parsed.data.comment,
      photos: parsed.data.photos,
      isVerified: true, // booking-based review is verified
    },
  });

  // Recalculate provider trust score
  await recalculateTrustScore(booking.providerId);

  // Notify provider
  const stars = "★".repeat(parsed.data.rating) + "☆".repeat(5 - parsed.data.rating);
  await notify(
    booking.providerId,
    "REVIEW",
    "Nueva resena recibida",
    `${session.user.name} te dejo una resena ${stars}`,
    `/providers/${booking.providerId}`,
  );

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/providers/${booking.providerId}`);
  return { success: true };
}

export async function respondToReview(reviewId: string, response: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review || review.targetId !== session.user.id) {
    return { error: "Resena no encontrada" };
  }

  if (review.response) {
    return { error: "Ya respondiste a esta resena" };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      response,
      respondedAt: new Date(),
    },
  });

  // Notify the review author
  await notify(
    review.authorId,
    "REVIEW",
    "Respuesta a tu resena",
    "El proveedor ha respondido a tu resena",
    `/providers/${session.user.id}`,
  );

  revalidatePath(`/providers/${session.user.id}`);
  revalidatePath("/provider");
  return { success: true };
}

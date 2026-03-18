"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function refundPayment(bookingId: string, percentage: number) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment || payment.status !== "SUCCEEDED") {
    return { error: "No hay pago para reembolsar" };
  }

  if (!payment.stripePaymentIntent) {
    return { error: "No se encontro el pago en Stripe" };
  }

  const refundAmount = Math.round(payment.amount * (percentage / 100));

  try {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntent,
      amount: refundAmount,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: percentage === 100 ? "REFUNDED" : "SUCCEEDED",
        refundAmount,
        refundedAt: new Date(),
      },
    });

    return { success: true, refundAmount };
  } catch {
    return { error: "Error al procesar el reembolso" };
  }
}

export async function getPaymentByBooking(bookingId: string) {
  const session = await auth();
  if (!session) return null;

  return prisma.payment.findUnique({
    where: { bookingId },
  });
}

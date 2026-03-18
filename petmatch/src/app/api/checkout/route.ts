import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId requerido" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Esta reserva aun no ha sido confirmada por el proveedor" }, { status: 400 });
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (existingPayment?.status === "SUCCEEDED") {
    return NextResponse.json({ error: "Ya se realizo el pago" }, { status: 400 });
  }

  const amount = Math.round(booking.totalPrice);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "clp",
          unit_amount: amount,
          product_data: {
            name: booking.service.title,
            description: `Reserva PetMatch - ${booking.service.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId: session.user.id,
    },
    success_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings/${booking.id}?payment=success`,
    cancel_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings/${booking.id}?payment=cancelled`,
  });

  // Create or update payment record
  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        stripeSessionId: checkoutSession.id,
        amount,
        status: "PROCESSING",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        stripeSessionId: checkoutSession.id,
        amount,
        status: "PROCESSING",
      },
    });
  }

  return NextResponse.json({ url: checkoutSession.url });
}

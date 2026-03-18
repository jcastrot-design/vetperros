import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Firma invalida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      // Handle subscription checkout
      if (session.mode === "subscription") {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          const stripeSubId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan,
              stripeSubscriptionId: stripeSubId ?? null,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            update: {
              plan,
              stripeSubscriptionId: stripeSubId ?? null,
              status: "ACTIVE",
              cancelAtPeriodEnd: false,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });

          await notify(
            userId,
            "SYSTEM",
            "Suscripcion activada",
            `Tu plan ${plan} ha sido activado exitosamente.`,
            "/dashboard/subscription",
          );
        }
        break;
      }

      // Handle insurance checkout
      if (session.metadata?.type === "insurance") {
        const { policyId, userId, amount, platformFee, providerEarnings, period } = session.metadata ?? {};
        if (policyId) {
          const now   = new Date();
          const end   = new Date(now);
          period === "ANNUAL" ? end.setFullYear(end.getFullYear() + 1) : end.setMonth(end.getMonth() + 1);
          const periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

          await prisma.$transaction(async (tx) => {
            await tx.insurancePolicy.update({
              where: { id: policyId },
              data: {
                status:           "ACTIVE",
                startDate:        now,
                endDate:          end,
                totalPaid:        Number(amount),
                platformFee:      Number(platformFee),
                providerEarnings: Number(providerEarnings),
              },
            });
            await tx.insurancePolicyPayment.create({
              data: {
                policyId,
                amount:           Number(amount),
                platformFee:      Number(platformFee),
                providerEarnings: Number(providerEarnings),
                status:           "SUCCEEDED",
                stripeSessionId:  session.id,
                period:           periodLabel,
                paidAt:           now,
              },
            });
          });

          if (userId) {
            await notify(userId, "PAYMENT", "Seguro activado 🛡️",
              "Tu póliza ha sido activada exitosamente. Puedes verla en tu dashboard.",
              "/dashboard/insurance",
            );
          }
        }
        break;
      }

      // Handle marketplace checkout
      if (session.metadata?.type === "marketplace") {
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });

          const userId = session.metadata?.userId;
          if (userId) {
            await notify(
              userId,
              "ORDER",
              "Pago confirmado",
              "Tu pedido ha sido pagado exitosamente. Te avisaremos cuando sea enviado.",
              "/marketplace/orders",
            );
          }
        }
        break;
      }

      // Handle booking payment checkout
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) break;

      // Update payment
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntent: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        },
      });

      // Update booking to CONFIRMED
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: { service: true },
      });

      await prisma.bookingEvent.create({
        data: {
          bookingId,
          type: "PAYMENT_RECEIVED",
          data: JSON.stringify({ sessionId: session.id }),
        },
      });

      // Notify provider
      await notify(
        booking.providerId,
        "BOOKING",
        "Pago recibido",
        `Se recibio el pago por "${booking.service.title}". La reserva ha sido confirmada.`,
        "/provider/bookings",
      );

      // Notify client
      await notify(
        booking.clientId,
        "BOOKING",
        "Pago exitoso",
        `Tu pago por "${booking.service.title}" fue procesado. Reserva confirmada.`,
        `/dashboard/bookings/${bookingId}`,
      );

      // Send payment confirmation email (non-blocking)
      const client = await prisma.user.findUnique({
        where: { id: booking.clientId },
        select: { email: true, name: true },
      });
      if (client?.email) {
        sendPaymentSuccessEmail(
          client.email,
          client.name || "Cliente",
          booking.service.title,
          booking.totalPrice,
        ).catch(() => {});
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;

      // Handle expired marketplace checkout — restore stock
      if (session.metadata?.type === "marketplace") {
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });
          if (order && order.status === "PENDING") {
            await prisma.$transaction(async (tx) => {
              for (const item of order.items) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });
              }
              await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
              });
            });
          }
        }
        break;
      }

      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "FAILED" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const stripeSubId = sub.id;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: stripeSubId },
        data: {
          status: "CANCELLED",
          plan: "FREE",
        },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntent = charge.payment_intent;
      if (!paymentIntent) break;

      const piId = typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;

      await prisma.payment.updateMany({
        where: { stripePaymentIntent: piId },
        data: {
          status: "REFUNDED",
          refundAmount: (charge.amount_refunded || 0),
          refundedAt: new Date(),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

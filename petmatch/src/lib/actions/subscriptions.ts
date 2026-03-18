"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export const PLANS = {
  FREE: {
    name: "Gratis",
    price: 0,
    features: [
      "Hasta 2 mascotas",
      "Buscar servicios",
      "Reservas basicas",
      "Pasaporte digital",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: 4990,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    features: [
      "Mascotas ilimitadas",
      "PetMatch (matching)",
      "Notificaciones prioritarias",
      "Historial medico completo",
      "Descuento 10% en servicios",
      "Soporte prioritario",
    ],
  },
  PRO: {
    name: "Pro",
    price: 9990,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Todo de Premium",
      "GPS tracking en vivo",
      "Recordatorios automaticos",
      "Reportes de salud",
      "Descuento 20% en servicios",
      "Acceso anticipado a funciones",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function getMySubscription() {
  const session = await auth();
  if (!session) return null;

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return sub || { plan: "FREE" as const, status: "ACTIVE" as const };
}

export async function createSubscriptionCheckout(plan: "PREMIUM" | "PRO") {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const planInfo = PLANS[plan];
  if (!planInfo.stripePriceId) {
    return { error: "Plan no configurado en Stripe" };
  }

  // Get or create Stripe customer
  let sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    if (sub) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { stripeCustomerId: customerId },
      });
    } else {
      sub = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "FREE",
          stripeCustomerId: customerId,
        },
      });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: planInfo.stripePriceId, quantity: 1 }],
    metadata: {
      userId: session.user.id,
      plan,
    },
    success_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/subscription?success=true`,
    cancel_url: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/subscription?cancelled=true`,
  });

  return { url: checkoutSession.url };
}

export async function cancelSubscription() {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub || !sub.stripeSubscriptionId) {
    return { error: "No hay suscripcion activa" };
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { cancelAtPeriodEnd: true },
  });

  revalidatePath("/dashboard/subscription");
  return { success: true };
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { planId, petId, period } = await req.json();
  if (!planId || !petId) {
    return NextResponse.json({ error: "planId y petId son requeridos" }, { status: 400 });
  }

  const [plan, pet] = await Promise.all([
    prisma.insurancePlan.findFirst({
      where: { id: planId, approvalStatus: "APPROVED", isActive: true },
    }),
    prisma.pet.findFirst({
      where: { id: petId, ownerId: session.user.id },
    }),
  ]);

  if (!plan) return NextResponse.json({ error: "Plan no encontrado o no disponible" }, { status: 404 });
  if (!pet)  return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });

  // Check no active policy for this pet+plan
  const existingPolicy = await prisma.insurancePolicy.findFirst({
    where: { userId: session.user.id, planId, petId, status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
  });
  if (existingPolicy) {
    return NextResponse.json({ error: "Ya tienes una póliza activa para esta mascota en este plan" }, { status: 409 });
  }

  const isAnnual  = period === "ANNUAL" && plan.annualPrice;
  const amount    = Math.round(isAnnual ? plan.annualPrice! : plan.price);
  const platformFee      = Math.round(amount * plan.commissionRate);
  const providerEarnings = amount - platformFee;

  // Create policy in PENDING_PAYMENT state
  const policy = await prisma.insurancePolicy.create({
    data: {
      userId:          session.user.id,
      planId,
      petId,
      status:          "PENDING_PAYMENT",
      autoRenew:       true,
      totalPaid:       0,
      platformFee:     0,
      providerEarnings: 0,
    },
  });

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "clp",
          unit_amount: amount,
          product_data: {
            name: `${plan.name} — ${pet.name}`,
            description: `Seguro ${plan.providerName} · ${isAnnual ? "Pago anual" : "Pago mensual"} · Mascota: ${pet.name}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type:            "insurance",
      policyId:        policy.id,
      planId,
      petId,
      userId:          session.user.id,
      amount:          String(amount),
      platformFee:     String(platformFee),
      providerEarnings: String(providerEarnings),
      period:          isAnnual ? "ANNUAL" : "MONTHLY",
    },
    success_url: `${baseUrl}/dashboard/insurance?payment=success`,
    cancel_url:  `${baseUrl}/services?type=INSURANCE&payment=cancelled`,
  });

  // Link stripe session to policy
  await prisma.insurancePolicy.update({
    where: { id: policy.id },
    data:  { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

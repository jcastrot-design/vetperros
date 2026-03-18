import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { items, shippingAddress, couponCode } = await req.json() as {
    items: { productId: string; quantity: number }[];
    shippingAddress: string;
    couponCode?: string;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Carrito vacio" }, { status: 400 });
  }

  if (!shippingAddress?.trim()) {
    return NextResponse.json({ error: "Direccion requerida" }, { status: 400 });
  }

  // Fetch and validate products
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== items.length) {
    return NextResponse.json({ error: "Algunos productos no estan disponibles" }, { status: 400 });
  }

  // Validate stock and build line items
  const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [];
  const orderItems: { productId: string; quantity: number; unitPrice: number }[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuficiente para "${product.title}"` }, { status: 400 });
    }

    totalAmount += product.price * item.quantity;
    orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });

    lineItems.push({
      price_data: {
        currency: "clp",
        product_data: { name: product.title },
        unit_amount: Math.round(product.price),
      },
      quantity: item.quantity,
    });
  }

  // Validate coupon if provided
  let discountAmount = 0;
  let validatedCouponCode: string | undefined;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (coupon && !coupon.usedAt && coupon.expiresAt > new Date() && coupon.userId === session.user.id) {
      discountAmount = Math.round(totalAmount * coupon.discount / 100);
      validatedCouponCode = coupon.code;
    }
  }
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // Create order in DB (PENDING)
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        buyerId: session.user.id,
        totalAmount: finalAmount,
        discountAmount,
        couponCode: validatedCouponCode,
        shippingAddress,
        items: { create: orderItems },
      },
    });

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Mark coupon as used
    if (validatedCouponCode) {
      await tx.coupon.update({
        where: { code: validatedCouponCode },
        data: { usedAt: new Date(), usedBy: o.id },
      });
    }

    return o;
  });

  // Create Stripe checkout session
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

  // If a discount was applied, replace line items with a single total line
  const stripeLineItems = discountAmount > 0
    ? [{
        price_data: {
          currency: "clp",
          product_data: { name: `Orden Marketplace (cupón ${validatedCouponCode} aplicado)` },
          unit_amount: Math.round(finalAmount),
        },
        quantity: 1,
      }]
    : lineItems;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: stripeLineItems,
    metadata: {
      type: "marketplace",
      orderId: order.id,
      userId: session.user.id,
    },
    success_url: `${baseUrl}/marketplace/orders?payment=success`,
    cancel_url: `${baseUrl}/marketplace/cart`,
  });

  // Store stripe session ID on the order
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

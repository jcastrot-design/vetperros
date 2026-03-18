import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

// GET /api/mobile/orders — historial de órdenes del usuario
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { buyerId: session.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, photos: true, category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return corsJson({ data: orders });
}

// POST /api/mobile/orders — crear orden desde el carrito
// Body: { items: [{ productId: string, quantity: number }], shippingAddress?: string }
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.items?.length) {
    return corsJson({ error: "Se requiere al menos un producto" }, { status: 400 });
  }

  const { items, shippingAddress } = body as {
    items: { productId: string; quantity: number }[];
    shippingAddress?: string;
  };

  // Fetch products to validate stock and get prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true, approvalStatus: "APPROVED" },
  });

  if (products.length !== productIds.length) {
    return corsJson({ error: "Uno o más productos no están disponibles" }, { status: 400 });
  }

  // Validate stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      return corsJson({ error: `Stock insuficiente para: ${product.title}` }, { status: 400 });
    }
  }

  // Calculate total
  const totalAmount = items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return acc + product.price * item.quantity;
  }, 0);

  // Create order + items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        buyerId: session.id,
        totalAmount,
        shippingAddress: shippingAddress ?? "",
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
      include: {
        items: { include: { product: { select: { id: true, title: true } } } },
      },
    });

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return corsJson({ data: order }, { status: 201 });
}

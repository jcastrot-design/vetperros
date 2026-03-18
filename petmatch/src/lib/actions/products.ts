"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";

export async function createProduct(formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  // Check email verification
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    return { error: "Debes verificar tu email antes de publicar productos" };
  }

  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      sellerId: session.user.id,
      approvalStatus: "PENDING_REVIEW",
    },
  });

  revalidatePath("/marketplace");
  return { success: true };
}

export async function updateProduct(productId: string, formData: unknown) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== session.user.id) {
    return { error: "Producto no encontrado" };
  }

  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { ...parsed.data, approvalStatus: "PENDING_REVIEW" },
  });

  revalidatePath("/marketplace");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== session.user.id) {
    return { error: "Producto no encontrado" };
  }

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/marketplace");
  return { success: true };
}

export async function approveProduct(productId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true, title: true },
  });
  if (!product) return { error: "Producto no encontrado" };

  await prisma.product.update({
    where: { id: productId },
    data: { approvalStatus: "APPROVED", rejectionReason: null },
  });

  await notify(
    product.sellerId,
    "SYSTEM",
    "Producto aprobado ✅",
    `Tu producto "${product.title}" fue aprobado y ya está visible en el Marketplace.`,
    "/marketplace/my-products",
  );

  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
  return { success: true };
}

export async function rejectProduct(productId: string, reason: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true, title: true },
  });
  if (!product) return { error: "Producto no encontrado" };

  await prisma.product.update({
    where: { id: productId },
    data: { approvalStatus: "REJECTED", rejectionReason: reason || "No cumple los requisitos" },
  });

  await notify(
    product.sellerId,
    "SYSTEM",
    "Producto rechazado",
    `Tu producto "${product.title}" fue rechazado: ${reason || "No cumple los requisitos"}.`,
    "/marketplace/my-products",
  );

  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
  return { success: true };
}

export async function getMyProducts() {
  const session = await auth();
  if (!session) return [];

  return prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrders() {
  const session = await auth();
  if (!session) return [];

  return prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      items: {
        include: { product: { select: { title: true, photos: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (session.user.role !== "ADMIN") {
    return { error: "Solo administradores pueden actualizar pedidos" };
  }

  const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return { error: "Estado invalido" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true },
  });

  if (order) {
    const statusMessages: Record<string, string> = {
      PAID: "Tu pedido ha sido confirmado.",
      SHIPPED: "Tu pedido ha sido enviado. Pronto lo recibirás!",
      DELIVERED: "Tu pedido ha sido marcado como entregado. Recuerda calificarlo!",
      CANCELLED: "Tu pedido ha sido cancelado.",
    };
    if (statusMessages[status]) {
      await notify(
        order.buyerId,
        "ORDER",
        status === "SHIPPED" ? "Pedido enviado" : status === "DELIVERED" ? "Pedido entregado" : "Actualización de pedido",
        statusMessages[status],
        `/marketplace/orders/${orderId}`,
      );
    }
  }

  revalidatePath(`/marketplace/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function confirmAndRate(orderId: string, rating: number, review?: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (rating < 1 || rating > 5) return { error: "Calificación inválida" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { sellerId: true, title: true } } },
      },
    },
  });

  if (!order) return { error: "Pedido no encontrado" };
  if (order.buyerId !== session.user.id) return { error: "No autorizado" };
  if (!["SHIPPED", "DELIVERED"].includes(order.status)) {
    return { error: "El pedido aún no ha sido enviado" };
  }
  if (order.buyerRating) return { error: "Ya calificaste este pedido" };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      buyerRating: rating,
      buyerReview: review?.trim() || null,
      ratedAt: new Date(),
      payoutStatus: "RELEASED",
    },
  });

  // Notify each unique seller
  const sellerIds = [...new Set(order.items.map((i) => i.product.sellerId))];
  for (const sellerId of sellerIds) {
    await notify(
      sellerId,
      "ORDER",
      "Pago liberado 💰",
      `Un comprador confirmó la recepción de su pedido y dejó ${rating} ⭐. Tu pago ha sido liberado.`,
      "/marketplace/my-products",
    );
  }

  revalidatePath(`/marketplace/orders/${orderId}`);
  return { success: true };
}

export async function createOrder(items: { productId: string; quantity: number }[], shippingAddress?: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  if (items.length === 0) return { error: "El carrito esta vacio" };

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true, approvalStatus: "APPROVED" },
  });

  if (products.length !== items.length) {
    return { error: "Algunos productos no están disponibles" };
  }

  let totalAmount = 0;
  const orderItems: { productId: string; quantity: number; unitPrice: number }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: `Producto no encontrado` };
    if (product.stock < item.quantity) {
      return { error: `Stock insuficiente para "${product.title}"` };
    }
    totalAmount += product.price * item.quantity;
    orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
  }

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        buyerId: session.user.id,
        totalAmount,
        shippingAddress,
        items: { create: orderItems },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return o;
  });

  revalidatePath("/marketplace");
  return { success: true, orderId: order.id };
}

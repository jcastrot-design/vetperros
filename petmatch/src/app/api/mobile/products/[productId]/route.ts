import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { productId } = await params;

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, approvalStatus: "APPROVED" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      photos: true,
      stock: true,
      petSpecies: true,
      seller: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!product) return corsJson({ error: "Producto no encontrado" }, { status: 404 });

  return corsJson({ data: product });
}

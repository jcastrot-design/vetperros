import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

export function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return corsJson({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
      ...(category ? { category } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
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
      seller: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return corsJson({ data: products });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      },
      include: {
        provider: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: services }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (err) {
    console.error("[mobile/services]", err);
    return NextResponse.json({ error: "Error interno", detail: String(err) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}

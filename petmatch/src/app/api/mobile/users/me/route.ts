import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";
import { z } from "zod/v4";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  pushToken: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, email: true, role: true,
      avatarUrl: true, phone: true, createdAt: true,
      _count: { select: { pets: true, bookingsAsClient: true } },
    },
  });

  return NextResponse.json({ data: user });
}

export async function PATCH(req: NextRequest) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { pushToken, ...profileData } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...profileData,
      ...(pushToken !== undefined ? { expoPushToken: pushToken } : {}),
    },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, phone: true },
  });

  return NextResponse.json({ data: user });
}

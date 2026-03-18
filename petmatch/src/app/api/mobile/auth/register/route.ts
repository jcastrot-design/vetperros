import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["OWNER", "WALKER", "VET", "CLINIC"]),
});

export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return corsJson({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return corsJson({ error: "Ya existe una cuenta con este email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true },
    });

    return corsJson({ user }, { status: 201 });
  } catch (err) {
    console.error("[mobile/auth/register]", err);
    return corsJson({ error: "Error interno" }, { status: 500 });
  }
}

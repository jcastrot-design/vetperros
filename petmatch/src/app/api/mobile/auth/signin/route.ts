import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod/v4";
import { corsJson, corsOptions } from "@/lib/mobile/cors";

const signInSchema = z.object({
  email: z.email("Email invalido"),
  password: z.string().min(6),
});

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not configured");
  return new TextEncoder().encode(secret);
}

export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return corsJson({ error: "Email o contraseña inválidos" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return corsJson({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return corsJson({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (user.isBanned) {
      return corsJson({ error: "Tu cuenta ha sido suspendida" }, { status: 403 });
    }

    const token = await new SignJWT({
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.avatarUrl,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getSecret());

    return corsJson({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[mobile/auth/signin]", err);
    return corsJson({ error: "Error interno" }, { status: 500 });
  }
}

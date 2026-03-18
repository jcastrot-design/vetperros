"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { signUpSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";
export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}) {
  const parsed = signUpSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return { error: "Ya existe una cuenta con este email" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal whether the email exists
  if (!user) return { success: true };

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  // Send reset email
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  sendPasswordResetEmail(email, resetUrl).catch(() => {});

  // In dev, also return the reset link directly for convenience
  const isDev = process.env.NODE_ENV === "development";
  return {
    success: true,
    devResetUrl: isDev ? `/reset-password?token=${token}` : undefined,
  };
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  if (password.length < 6) return { error: "La contrasena debe tener al menos 6 caracteres" };
  if (password !== confirmPassword) return { error: "Las contrasenas no coinciden" };

  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record) return { error: "Token invalido o expirado" };
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token } } });
    return { error: "Token expirado. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: record.identifier },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  return { success: true };
}

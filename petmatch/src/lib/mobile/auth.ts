import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export type MobileSession = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "WALKER" | "VET" | "CLINIC" | "ADMIN";
  image?: string | null;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not configured");
  return new TextEncoder().encode(secret);
}

/**
 * Validates the Bearer token from mobile requests.
 * Usage:
 *   const session = await getMobileSession(req);
 *   if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
 */
export async function getMobileSession(req: NextRequest): Promise<MobileSession | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, getSecret());

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as MobileSession["role"],
      image: payload.image as string | null,
    };
  } catch {
    return null;
  }
}

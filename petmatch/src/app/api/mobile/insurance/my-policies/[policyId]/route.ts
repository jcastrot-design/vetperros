import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobile/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ policyId: string }> },
) {
  const session = await getMobileSession(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { policyId } = await params;
  const { action, reason } = await req.json();

  if (action !== "cancel") {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  const policy = await prisma.insurancePolicy.findUnique({ where: { id: policyId } });
  if (!policy || policy.userId !== session.id) {
    return NextResponse.json({ error: "Póliza no encontrada" }, { status: 404 });
  }
  if (policy.status !== "ACTIVE") {
    return NextResponse.json({ error: "Solo puedes cancelar pólizas activas" }, { status: 400 });
  }

  await prisma.insurancePolicy.update({
    where: { id: policyId },
    data: {
      status:      "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: reason || "Cancelado por el usuario",
      autoRenew:   false,
    },
  });

  return NextResponse.json({ success: true });
}

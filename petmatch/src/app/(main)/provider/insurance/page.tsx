import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Users, DollarSign, ToggleLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { PlanToggleButton } from "./plan-toggle-button";
import { DeletePlanButton } from "./delete-plan-button";

const statusColors: Record<string, string> = {
  APPROVED:       "bg-green-100 text-green-700",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  REJECTED:       "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  APPROVED:       "Aprobado",
  PENDING_REVIEW: "En revisión",
  REJECTED:       "Rechazado",
};

export default async function InsuranceProviderPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "INSURANCE_PROVIDER") redirect("/dashboard");

  const userId = session.user.id;

  const [plans, activePolicies, earningsAgg] = await Promise.all([
    prisma.insurancePlan.findMany({
      where: { providerId: userId },
      include: { _count: { select: { policies: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.insurancePolicy.count({
      where: { plan: { providerId: userId }, status: "ACTIVE" },
    }),
    prisma.insurancePolicyPayment.aggregate({
      where: { policy: { plan: { providerId: userId } }, status: "SUCCEEDED" },
      _sum: { providerEarnings: true },
    }),
  ]);

  const totalEarnings = earningsAgg._sum.providerEarnings ?? 0;
  const pendingCount  = plans.filter((p) => p.approvalStatus === "PENDING_REVIEW").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Planes de Seguro</h1>
          <p className="text-muted-foreground">Gestiona tus planes y visualiza tus ingresos</p>
        </div>
        <Link href="/provider/insurance/new">
          <Button className="bg-brand hover:bg-brand-hover">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planes publicados</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            {pendingCount > 0 && (
              <p className="text-xs text-yellow-600 mt-1">{pendingCount} en revisión</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pólizas activas</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies}</div>
            <p className="text-xs text-muted-foreground">clientes asegurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos netos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString("es-CL")}</div>
            <p className="text-xs text-muted-foreground">después de comisión PetMatch</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Shield className="h-12 w-12 text-muted-foreground/40" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">Aún no tienes planes publicados</p>
              <p className="text-sm text-muted-foreground mt-1">Crea tu primer plan y llega a miles de dueños de mascotas</p>
            </div>
            <Link href="/provider/insurance/new">
              <Button className="bg-brand hover:bg-brand-hover">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear primer plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const coverages: string[] = JSON.parse(plan.coverages ?? "[]");
            return (
              <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-base">{plan.name}</h3>
                        <Badge className={statusColors[plan.approvalStatus] ?? ""}>
                          {statusLabels[plan.approvalStatus] ?? plan.approvalStatus}
                        </Badge>
                        {!plan.isActive && (
                          <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {coverages.slice(0, 4).map((c, i) => (
                          <span key={i} className="text-xs bg-muted rounded-full px-2.5 py-0.5">{c}</span>
                        ))}
                        {coverages.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{coverages.length - 4} más</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          ${plan.price.toLocaleString("es-CL")}<span className="font-normal text-muted-foreground">/mes</span>
                        </span>
                        {plan.annualPrice && (
                          <span>${plan.annualPrice.toLocaleString("es-CL")}/año</span>
                        )}
                        <span>{plan._count.policies} póliza{plan._count.policies !== 1 ? "s" : ""}</span>
                      </div>
                      {plan.approvalStatus === "REJECTED" && plan.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 rounded p-2">
                          <strong>Motivo de rechazo:</strong> {plan.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <PlanToggleButton planId={plan.id} isActive={plan.isActive} />
                      <Link href={`/provider/insurance/${plan.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <DeletePlanButton planId={plan.id} activePolicies={plan._count.policies} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <ToggleLeft className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">¿Cómo funciona la comisión?</p>
              <p className="mt-1">PetMatch retiene un <strong>15%</strong> de cada prima cobrada como comisión de plataforma. Recibirás el <strong>85% restante</strong> a tu cuenta registrada.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

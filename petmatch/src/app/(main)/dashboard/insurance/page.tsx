import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyInsurancePolicies } from "@/lib/actions/insurance";
import type { InsurancePolicyWithRelations } from "@/lib/actions/insurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Shield, PlusCircle, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CancelPolicyButton } from "./cancel-policy-button";
import { cn } from "@/lib/utils";

const statusConfig = {
  ACTIVE:          { label: "Activa",          icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  PENDING_PAYMENT: { label: "Pago pendiente",  icon: Clock,        color: "bg-yellow-100 text-yellow-700" },
  CANCELLED:       { label: "Cancelada",       icon: XCircle,      color: "bg-red-100 text-red-700" },
  EXPIRED:         { label: "Expirada",        icon: AlertCircle,  color: "bg-gray-100 text-gray-700" },
};

export default async function DashboardInsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { payment } = await searchParams;
  const policies = await getMyInsurancePolicies();

  const activePolicies: InsurancePolicyWithRelations[]  = policies.filter((p) => p.status === "ACTIVE");
  const otherPolicies:  InsurancePolicyWithRelations[]  = policies.filter((p) => p.status !== "ACTIVE");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Mis seguros
          </h1>
          <p className="text-muted-foreground">Pólizas de seguro para tus mascotas</p>
        </div>
        <Link href="/services?type=INSURANCE" className={cn(buttonVariants())}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Contratar nuevo
        </Link>
      </div>

      {/* Payment success banner */}
      {payment === "success" && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">¡Pago confirmado!</p>
            <p className="text-sm text-green-700">Tu póliza ha sido activada exitosamente.</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {policies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <div>
              <p className="font-medium text-lg">Sin pólizas activas</p>
              <p className="text-sm text-muted-foreground">
                Protege a tus mascotas contratando un seguro
              </p>
            </div>
            <Link href="/services?type=INSURANCE" className={cn(buttonVariants())}>
              Ver planes de seguro
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active policies */}
      {activePolicies.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Pólizas activas
          </h2>
          {activePolicies.map((policy) => {
            const coverages: string[] = JSON.parse(policy.plan.coverages ?? "[]");
            const cfg = statusConfig["ACTIVE"];
            const Icon = cfg.icon;

            return (
              <Card key={policy.id} className="border-green-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{policy.plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{policy.plan.providerName}</p>
                    </div>
                    <Badge className={cfg.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>
                      <span className="text-muted-foreground">Mascota: </span>
                      <span className="font-medium">{policy.pet.name}</span>
                    </span>
                    {policy.startDate && (
                      <span>
                        <span className="text-muted-foreground">Inicio: </span>
                        {new Date(policy.startDate).toLocaleDateString("es-CL")}
                      </span>
                    )}
                    {policy.endDate && (
                      <span>
                        <span className="text-muted-foreground">Vence: </span>
                        {new Date(policy.endDate).toLocaleDateString("es-CL")}
                      </span>
                    )}
                    <span>
                      <span className="text-muted-foreground">Pagado: </span>
                      <span className="font-medium">${policy.totalPaid.toLocaleString("es-CL")} CLP</span>
                    </span>
                  </div>
                  {coverages.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {coverages.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <CancelPolicyButton policyId={policy.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Past / pending policies */}
      {otherPolicies.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Historial
          </h2>
          {otherPolicies.map((policy) => {
            const cfg = statusConfig[policy.status as keyof typeof statusConfig] ?? statusConfig.EXPIRED;
            const Icon = cfg.icon;

            return (
              <Card key={policy.id} className="opacity-70">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{policy.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.pet.name} · {policy.plan.providerName}
                      </p>
                    </div>
                    <Badge className={cfg.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

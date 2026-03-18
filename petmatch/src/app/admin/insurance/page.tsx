import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { InsurancePlanApproveRejectButtons } from "./approve-reject-buttons";

const statusConfig = {
  PENDING_REVIEW: { label: "Pendiente",  icon: Clock,         color: "bg-yellow-100 text-yellow-700" },
  APPROVED:       { label: "Aprobado",   icon: CheckCircle2,  color: "bg-green-100 text-green-700" },
  REJECTED:       { label: "Rechazado",  icon: XCircle,       color: "bg-red-100 text-red-700" },
};

export default async function AdminInsurancePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const plans = await prisma.insurancePlan.findMany({
    orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { policies: { where: { status: "ACTIVE" } } } },
    },
  });

  const pending  = plans.filter((p) => p.approvalStatus === "PENDING_REVIEW");
  const approved = plans.filter((p) => p.approvalStatus === "APPROVED");
  const rejected = plans.filter((p) => p.approvalStatus === "REJECTED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Planes de seguro
        </h1>
        <p className="text-muted-foreground">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""} de revisión ·{" "}
          {approved.length} aprobado{approved.length !== 1 ? "s" : ""} ·{" "}
          {rejected.length} rechazado{rejected.length !== 1 ? "s" : ""}
        </p>
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay planes de seguro aún.
          </CardContent>
        </Card>
      )}

      {[
        { title: "Pendientes de revisión", items: pending },
        { title: "Aprobados", items: approved },
        { title: "Rechazados", items: rejected },
      ].map(({ title, items }) =>
        items.length === 0 ? null : (
          <div key={title} className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {title}
            </h2>
            {items.map((plan) => {
              const cfg = statusConfig[plan.approvalStatus as keyof typeof statusConfig] ?? statusConfig.PENDING_REVIEW;
              const Icon = cfg.icon;
              const coverages: string[] = JSON.parse(plan.coverages ?? "[]");

              return (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.providerName}</p>
                      </div>
                      <Badge className={cfg.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span>
                        <span className="text-muted-foreground">Precio: </span>
                        <span className="font-medium">${plan.price.toLocaleString("es-CL")} / mes</span>
                      </span>
                      {plan.annualPrice && (
                        <span>
                          <span className="text-muted-foreground">Anual: </span>
                          ${plan.annualPrice.toLocaleString("es-CL")}
                        </span>
                      )}
                      <span>
                        <span className="text-muted-foreground">Comisión: </span>
                        {Math.round(plan.commissionRate * 100)}%
                      </span>
                      <span>
                        <span className="text-muted-foreground">Pólizas activas: </span>
                        {plan._count.policies}
                      </span>
                    </div>
                    {coverages.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {coverages.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    )}
                    {plan.rejectionReason && (
                      <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                        Motivo de rechazo: {plan.rejectionReason}
                      </p>
                    )}
                    <div className="pt-1 border-t">
                      <InsurancePlanApproveRejectButtons planId={plan.id} planName={plan.name} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

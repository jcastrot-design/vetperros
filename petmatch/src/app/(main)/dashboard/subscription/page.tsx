"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { getMySubscription, createSubscriptionCheckout, cancelSubscription, PLANS } from "@/lib/actions/subscriptions";
import type { PlanKey } from "@/lib/actions/subscriptions";
import { toast } from "sonner";

const planIcons: Record<string, typeof Crown> = {
  FREE: Zap,
  PREMIUM: Crown,
  PRO: Crown,
};

const planColors: Record<string, string> = {
  FREE: "border-gray-200",
  PREMIUM: "border-orange-300 bg-orange-50/30",
  PRO: "border-purple-300 bg-purple-50/30",
};

const planBadgeColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700",
  PREMIUM: "bg-orange-100 text-orange-700",
  PRO: "bg-purple-100 text-purple-700",
};

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [cancelAtEnd, setCancelAtEnd] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getMySubscription().then((sub) => {
      if (sub) {
        setCurrentPlan(sub.plan);
        if ("cancelAtPeriodEnd" in sub) {
          setCancelAtEnd(sub.cancelAtPeriodEnd);
        }
      }
    });
  }, []);

  async function handleSubscribe(plan: "PREMIUM" | "PRO") {
    setLoading(plan);
    const result = await createSubscriptionCheckout(plan);
    if (result.error) {
      toast.error(result.error);
      setLoading(null);
      return;
    }
    if (result.url) {
      window.location.href = result.url;
    }
  }

  async function handleCancel() {
    setLoading("cancel");
    const result = await cancelSubscription();
    setLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Suscripcion cancelada. Se mantendra activa hasta el final del periodo.");
      setCancelAtEnd(true);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscripcion</h1>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      {cancelAtEnd && (
        <div className="p-3 border rounded-lg bg-yellow-50 text-yellow-800 text-sm">
          Tu suscripcion se cancelara al final del periodo actual.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(([key, plan]) => {
          const Icon = planIcons[key];
          const isCurrent = currentPlan === key;

          return (
            <Card key={key} className={`relative ${planColors[key]} ${isCurrent ? "ring-2 ring-orange-500" : ""}`}>
              {key === "PREMIUM" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-orange-500">Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2">
                  <Icon className={`h-8 w-8 ${key === "PRO" ? "text-purple-500" : key === "PREMIUM" ? "text-orange-500" : "text-gray-400"}`} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Gratis</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold">${plan.price.toLocaleString("es-CL")}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${key === "PRO" ? "text-purple-500" : key === "PREMIUM" ? "text-orange-500" : "text-green-500"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="space-y-2">
                    <Badge className={`w-full justify-center py-1.5 ${planBadgeColors[key]}`}>
                      Plan actual
                    </Badge>
                    {key !== "FREE" && !cancelAtEnd && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-500 hover:text-red-600"
                        onClick={handleCancel}
                        disabled={loading === "cancel"}
                      >
                        {loading === "cancel" && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                        Cancelar suscripcion
                      </Button>
                    )}
                  </div>
                ) : key !== "FREE" ? (
                  <Button
                    className={`w-full ${key === "PRO" ? "bg-purple-500 hover:bg-purple-600" : "bg-brand hover:bg-brand-hover"}`}
                    onClick={() => handleSubscribe(key as "PREMIUM" | "PRO")}
                    disabled={loading === key}
                  >
                    {loading === key && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                    Suscribirme
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

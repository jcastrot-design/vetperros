"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleInsurancePlan } from "@/lib/actions/insurance";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function PlanToggleButton({ planId, isActive }: { planId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const res = await toggleInsurancePlan(planId, !isActive);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success(isActive ? "Plan desactivado" : "Plan activado");
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading} title={isActive ? "Desactivar" : "Activar"}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
    </Button>
  );
}

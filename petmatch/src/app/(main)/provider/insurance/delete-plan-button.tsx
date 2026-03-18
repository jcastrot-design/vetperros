"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteInsurancePlan } from "@/lib/actions/insurance";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePlanButton({ planId, activePolicies }: { planId: string; activePolicies: number }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (activePolicies > 0) {
      toast.error("No puedes eliminar un plan con pólizas activas");
      return;
    }
    if (!confirm("¿Eliminar este plan? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const res = await deleteInsurancePlan(planId);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Plan eliminado");
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading} className="text-red-500 hover:text-red-700 hover:border-red-300">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}

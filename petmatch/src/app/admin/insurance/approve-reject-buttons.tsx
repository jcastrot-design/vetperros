"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveInsurancePlan, rejectInsurancePlan } from "@/lib/actions/insurance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function InsurancePlanApproveRejectButtons({
  planId,
  planName,
}: {
  planId: string;
  planName: string;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  async function handleApprove() {
    setLoading("approve");
    const result = await approveInsurancePlan(planId);
    setLoading(null);
    if (result?.error) { toast.error(result.error); return; }
    toast.success(`"${planName}" aprobado`);
    router.refresh();
  }

  async function handleReject() {
    if (!showRejectInput) { setShowRejectInput(true); return; }
    if (!reason.trim()) { toast.error("Escribe el motivo del rechazo"); return; }
    setLoading("reject");
    const result = await rejectInsurancePlan(planId, reason);
    setLoading(null);
    if (result?.error) { toast.error(result.error); return; }
    toast.success(`"${planName}" rechazado`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {showRejectInput && (
        <Input
          placeholder="Motivo del rechazo..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-sm"
          autoFocus
        />
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs"
          onClick={handleApprove}
          disabled={!!loading}
        >
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
          Aprobar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 h-7 text-xs"
          onClick={handleReject}
          disabled={!!loading}
        >
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
          {showRejectInput ? "Confirmar rechazo" : "Rechazar"}
        </Button>
        {showRejectInput && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => { setShowRejectInput(false); setReason(""); }}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { cancelInsurancePolicy } from "@/lib/actions/insurance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CancelPolicyButton({ policyId }: { policyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const result = await cancelInsurancePolicy(policyId, reason || undefined);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Póliza cancelada correctamente");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <X className="h-4 w-4 mr-1" />
        Cancelar póliza
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar póliza</DialogTitle>
            <DialogDescription>
              La póliza se cancelará de inmediato. Esta acción no tiene reembolso automático.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="¿Por qué deseas cancelar?"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Volver
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar cancelación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

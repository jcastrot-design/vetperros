"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { withdrawApplication } from "@/lib/actions/adoptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleWithdraw() {
    setLoading(true);
    const result = await withdrawApplication(applicationId);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Solicitud retirada");
      router.refresh();
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
      onClick={handleWithdraw}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      Retirar
    </Button>
  );
}

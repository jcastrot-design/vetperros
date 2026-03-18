"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { reviewApplication } from "@/lib/actions/adoptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewApplicationButtonsProps {
  applicationId: string;
  applicantName: string;
}

export function ReviewApplicationButtons({ applicationId, applicantName }: ReviewApplicationButtonsProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handle(status: "APPROVED" | "REJECTED") {
    setLoading(status === "APPROVED" ? "approve" : "reject");
    const result = await reviewApplication(applicationId, status);
    setLoading(null);

    if (result?.error) {
      toast.error(result.error);
    } else if (status === "APPROVED") {
      toast.success(`Solicitud de ${applicantName} aprobada. Se creó un chat con ellos.`);
      router.refresh();
    } else {
      toast.success(`Solicitud de ${applicantName} rechazada.`);
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="h-8 text-xs bg-green-600 hover:bg-green-700"
        onClick={() => handle("APPROVED")}
        disabled={loading !== null}
      >
        {loading === "approve" ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="mr-1 h-3 w-3" />
        )}
        Aprobar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => handle("REJECTED")}
        disabled={loading !== null}
      >
        {loading === "reject" ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="mr-1 h-3 w-3" />
        )}
        Rechazar
      </Button>
    </div>
  );
}

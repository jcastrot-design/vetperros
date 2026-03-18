"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyClinic, unverifyClinic } from "@/lib/actions/clinic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  clinicId: string;
  isVerified: boolean;
}

export function VerifyClinicButtons({ clinicId, isVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async (action: "verify" | "unverify") => {
    setLoading(true);
    const result = action === "verify"
      ? await verifyClinic(clinicId)
      : await unverifyClinic(clinicId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(action === "verify" ? "Clínica verificada" : "Verificación removida");
      router.refresh();
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (isVerified) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handle("unverify")}
      >
        <XCircle className="h-3.5 w-3.5" />
        Remover
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
      onClick={() => handle("verify")}
    >
      <CheckCircle className="h-3.5 w-3.5" />
      Verificar
    </Button>
  );
}

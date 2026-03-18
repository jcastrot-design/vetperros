"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateLostPetStatus } from "@/lib/actions/lost-pets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UpdateStatusButton({
  lostPetId,
  currentStatus,
}: {
  lostPetId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate(status: "FOUND" | "REUNITED") {
    setLoading(true);
    const result = await updateLostPetStatus(lostPetId, status);
    setLoading(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success(status === "REUNITED" ? "¡Qué alegría! Reporte marcado como reunido." : "Estado actualizado.");
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      {currentStatus === "LOST" && (
        <Button
          variant="outline"
          className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
          disabled={loading}
          onClick={() => handleUpdate("FOUND")}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Marcar como encontrado
        </Button>
      )}
      <Button
        className="flex-1 bg-green-500 hover:bg-green-600"
        disabled={loading}
        onClick={() => handleUpdate("REUNITED")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
        ¡Ya lo encontré! 🎉
      </Button>
    </div>
  );
}

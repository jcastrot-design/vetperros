"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updatePostStatus } from "@/lib/actions/adoptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostStatusButtonProps {
  postId: string;
  currentStatus: string;
  markAdopted?: boolean;
}

export function PostStatusButton({ postId, currentStatus, markAdopted }: PostStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const nextStatus = markAdopted ? "ADOPTED" : currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
  const label = markAdopted ? "Marcar adoptado ✓" : currentStatus === "ACTIVE" ? "Pausar" : "Activar";

  async function handle() {
    setLoading(true);
    const result = await updatePostStatus(postId, nextStatus);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        nextStatus === "ADOPTED"
          ? "¡Felicidades! Publicación marcada como adoptada."
          : nextStatus === "PAUSED"
          ? "Publicación pausada"
          : "Publicación activada",
      );
      router.refresh();
    }
  }

  return (
    <Button
      size="sm"
      variant={markAdopted ? "default" : "outline"}
      className={`h-7 text-xs ${markAdopted ? "bg-green-600 hover:bg-green-700" : ""}`}
      onClick={handle}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {label}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { startOrGetConversation } from "@/lib/actions/conversations";
import { toast } from "sonner";

export function ProviderContactButton({ providerId }: { providerId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleContact() {
    setLoading(true);
    try {
      const result = await startOrGetConversation(providerId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.push(`/chat/${result.conversationId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleContact}
      disabled={loading}
      variant="outline"
      className="flex-1"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Enviar mensaje
    </Button>
  );
}

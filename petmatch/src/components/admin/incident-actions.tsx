"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle } from "lucide-react";
import { resolveIncident } from "@/lib/actions/incidents";
import { toast } from "sonner";

export function IncidentActions({ incidentId }: { incidentId: string }) {
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    if (!resolution.trim()) {
      toast.error("Escribe una resolucion");
      return;
    }
    setLoading(true);
    const result = await resolveIncident(incidentId, resolution);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Incidente resuelto");
    }
  }

  if (!resolving) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setResolving(true)}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Resolver
      </Button>
    );
  }

  return (
    <div className="space-y-2 border-t pt-3">
      <Textarea
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Describe como se resolvio el incidente..."
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={handleResolve}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Confirmar resolucion
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setResolving(false)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

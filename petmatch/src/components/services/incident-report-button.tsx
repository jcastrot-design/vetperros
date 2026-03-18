"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createIncident } from "@/lib/actions/incidents";
import { toast } from "sonner";

interface IncidentReportButtonProps {
  bookingId: string;
}

const categoryLabels: Record<string, string> = {
  PAYMENT: "Pago",
  SERVICE: "Servicio",
  PROVIDER: "Proveedor",
  EMERGENCY: "Emergencia",
};

const severityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
};

export function IncidentReportButton({ bookingId }: IncidentReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category || !severity) {
      toast.error("Selecciona una categoria y severidad");
      return;
    }

    setLoading(true);

    const result = await createIncident({
      bookingId,
      category,
      severity,
      description,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Reporte enviado", {
        description: "Tu reporte ha sido registrado y sera revisado por el equipo",
        duration: 4000,
      });
      setCategory("");
      setSeverity("");
      setDescription("");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" className="w-full" />}
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Reportar problema
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar un problema</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Severidad *</Label>
            <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la severidad" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(severityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripcion *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema con detalle..."
              rows={4}
              required
              minLength={10}
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={loading || !category || !severity || description.length < 10}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar reporte
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  PlusCircle, Stethoscope, Trash2, Calendar, Loader2,
  ChevronDown, ChevronUp, DollarSign,
} from "lucide-react";
import { addMedicalVisit, deleteMedicalVisit } from "@/lib/actions/pets";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { MedicalVisit } from "@/generated/prisma/client";

const visitTypes: Record<string, { label: string; color: string }> = {
  CHECKUP: { label: "Control", color: "bg-blue-100 text-blue-700" },
  EMERGENCY: { label: "Urgencia", color: "bg-red-100 text-red-700" },
  SURGERY: { label: "Cirugia", color: "bg-purple-100 text-purple-700" },
  DENTAL: { label: "Dental", color: "bg-cyan-100 text-cyan-700" },
  VACCINATION: { label: "Vacunacion", color: "bg-green-100 text-green-700" },
  OTHER: { label: "Otro", color: "bg-gray-100 text-gray-700" },
};

interface MedicalVisitListProps {
  petId: string;
  visits: MedicalVisit[];
}

export function MedicalVisitList({ petId, visits }: MedicalVisitListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visitType, setVisitType] = useState("CHECKUP");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await addMedicalVisit({
      petId,
      type: visitType,
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      veterinarian: (form.get("veterinarian") as string) || undefined,
      clinic: (form.get("clinic") as string) || undefined,
      diagnosis: (form.get("diagnosis") as string) || undefined,
      treatment: (form.get("treatment") as string) || undefined,
      cost: form.get("cost") ? Number(form.get("cost")) : undefined,
      visitDate: form.get("visitDate") as string,
      nextVisit: (form.get("nextVisit") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Visita registrada");
      setOpen(false);
      setVisitType("CHECKUP");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteMedicalVisit(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Visita eliminada");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Historial Medico ({visits.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-brand hover:bg-brand-hover" />}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Agregar
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar visita medica</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de visita *</Label>
                  <Select value={visitType} onValueChange={(v) => v && setVisitType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(visitTypes).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Fecha *</Label>
                  <Input id="visitDate" name="visitDate" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titulo / Motivo *</Label>
                <Input id="title" name="title" placeholder="Ej: Control anual, Consulta por vomitos..." required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinario</Label>
                  <Input id="veterinarian" name="veterinarian" placeholder="Nombre del veterinario" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clinica</Label>
                  <Input id="clinic" name="clinic" placeholder="Nombre de la clinica" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnostico</Label>
                <Textarea id="diagnosis" name="diagnosis" placeholder="Diagnostico del veterinario..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Tratamiento</Label>
                <Textarea id="treatment" name="treatment" placeholder="Tratamiento indicado..." rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo ($)</Label>
                  <Input id="cost" name="cost" type="number" min="0" step="100" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextVisit">Proxima visita</Label>
                  <Input id="nextVisit" name="nextVisit" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea id="description" name="description" placeholder="Detalles adicionales..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" placeholder="Observaciones..." rows={2} />
              </div>
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar visita
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay visitas registradas</p>
            <p className="text-sm">Registra las visitas medicas para llevar un historial completo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => {
              const typeInfo = visitTypes[visit.type] || visitTypes.OTHER;
              const isExpanded = expandedId === visit.id;

              return (
                <div
                  key={visit.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${typeInfo.color} hover:${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        <p className="font-medium">{visit.title}</p>
                      </div>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(visit.visitDate), "dd MMM yyyy", { locale: es })}
                        </span>
                        {visit.veterinarian && (
                          <span>{visit.veterinarian}</span>
                        )}
                        {visit.cost != null && visit.cost > 0 && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="h-3.5 w-3.5" />
                            {visit.cost.toLocaleString("es-CL")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(visit.id);
                        }}
                        disabled={deletingId === visit.id}
                      >
                        {deletingId === visit.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 border-t bg-muted/30">
                      <div className="grid gap-3 sm:grid-cols-2 pt-3 text-sm">
                        {visit.clinic && (
                          <div>
                            <p className="text-muted-foreground text-xs">Clinica</p>
                            <p>{visit.clinic}</p>
                          </div>
                        )}
                        {visit.diagnosis && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-xs">Diagnostico</p>
                            <p>{visit.diagnosis}</p>
                          </div>
                        )}
                        {visit.treatment && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-xs">Tratamiento</p>
                            <p>{visit.treatment}</p>
                          </div>
                        )}
                        {visit.description && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-xs">Descripcion</p>
                            <p>{visit.description}</p>
                          </div>
                        )}
                        {visit.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-xs">Notas</p>
                            <p>{visit.notes}</p>
                          </div>
                        )}
                        {visit.nextVisit && (
                          <div>
                            <p className="text-muted-foreground text-xs">Proxima visita</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(visit.nextVisit), "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

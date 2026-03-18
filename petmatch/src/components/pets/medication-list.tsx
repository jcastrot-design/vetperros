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
import { PlusCircle, Pill, Trash2, Loader2 } from "lucide-react";
import { addMedication, deleteMedication } from "@/lib/actions/pets";
import { toast } from "sonner";
import type { PetMedication } from "@/generated/prisma/client";

interface MedicationListProps {
  petId: string;
  medications: PetMedication[];
}

export function MedicationList({ petId, medications }: MedicationListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await addMedication({
      petId,
      name: form.get("name") as string,
      dosage: (form.get("dosage") as string) || undefined,
      frequency: (form.get("frequency") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
      isActive: true,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Medicamento agregado");
      setOpen(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteMedication(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Medicamento eliminado");
    }
  }

  const activeMeds = medications.filter((m) => m.isActive);
  const inactiveMeds = medications.filter((m) => !m.isActive);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Medicamentos ({medications.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-brand hover:bg-brand-hover" />}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Agregar
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar medicamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del medicamento *</Label>
                <Input id="name" name="name" placeholder="Ej: Condroitina, Milbemax..." required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosis</Label>
                  <Input id="dosage" name="dosage" placeholder="Ej: 1 tableta" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Input id="frequency" name="frequency" placeholder="Ej: 1 vez al dia" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" placeholder="Instrucciones adicionales..." rows={2} />
              </div>
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar medicamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay medicamentos registrados</p>
            <p className="text-sm">Agrega los medicamentos actuales de tu mascota</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeMeds.length > 0 && (
              <>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                {activeMeds.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{med.name}</p>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Activo</Badge>
                      </div>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        {med.dosage && <span>{med.dosage}</span>}
                        {med.frequency && <span>· {med.frequency}</span>}
                      </div>
                      {med.notes && <p className="text-xs text-muted-foreground">{med.notes}</p>}
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(med.id)}
                      disabled={deletingId === med.id}
                    >
                      {deletingId === med.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </>
            )}
            {inactiveMeds.length > 0 && (
              <>
                <p className="text-sm font-medium text-muted-foreground mt-4">Anteriores</p>
                {inactiveMeds.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                    <div className="space-y-1">
                      <p className="font-medium">{med.name}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        {med.dosage && <span>{med.dosage}</span>}
                        {med.frequency && <span>· {med.frequency}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(med.id)}
                      disabled={deletingId === med.id}
                    >
                      {deletingId === med.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

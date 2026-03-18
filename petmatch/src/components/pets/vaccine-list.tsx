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
import { PlusCircle, Syringe, Trash2, Calendar, Loader2 } from "lucide-react";
import { addVaccine, deleteVaccine } from "@/lib/actions/pets";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PetVaccine } from "@/generated/prisma/client";

interface VaccineListProps {
  petId: string;
  vaccines: PetVaccine[];
}

export function VaccineList({ petId, vaccines }: VaccineListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await addVaccine({
      petId,
      name: form.get("name") as string,
      dateAdministered: form.get("dateAdministered") as string,
      nextDueDate: (form.get("nextDueDate") as string) || undefined,
      veterinarian: (form.get("veterinarian") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Vacuna agregada");
      setOpen(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteVaccine(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Vacuna eliminada");
    }
  }

  function isOverdue(date: Date | null) {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  function isDueSoon(date: Date | null) {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    const days30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return d > now && d <= days30;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Syringe className="h-5 w-5" />
          Vacunas ({vaccines.length})
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
              <DialogTitle>Agregar vacuna</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la vacuna *</Label>
                <Input id="name" name="name" placeholder="Ej: Rabia, Sextuple..." required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateAdministered">Fecha de aplicacion *</Label>
                  <Input id="dateAdministered" name="dateAdministered" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Proxima dosis</Label>
                  <Input id="nextDueDate" name="nextDueDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinario</Label>
                <Input id="veterinarian" name="veterinarian" placeholder="Nombre del veterinario" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" placeholder="Observaciones..." rows={2} />
              </div>
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar vacuna
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {vaccines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Syringe className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay vacunas registradas</p>
            <p className="text-sm">Agrega las vacunas de tu mascota para llevar un registro</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vaccines.map((vaccine) => (
              <div
                key={vaccine.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vaccine.name}</p>
                    {vaccine.nextDueDate && isOverdue(vaccine.nextDueDate) && (
                      <Badge variant="destructive" className="text-xs">Vencida</Badge>
                    )}
                    {vaccine.nextDueDate && isDueSoon(vaccine.nextDueDate) && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        Proxima
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(vaccine.dateAdministered), "dd MMM yyyy", { locale: es })}
                    </span>
                    {vaccine.nextDueDate && (
                      <span>
                        Proxima: {format(new Date(vaccine.nextDueDate), "dd MMM yyyy", { locale: es })}
                      </span>
                    )}
                  </div>
                  {vaccine.veterinarian && (
                    <p className="text-xs text-muted-foreground">{vaccine.veterinarian}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(vaccine.id)}
                  disabled={deletingId === vaccine.id}
                >
                  {deletingId === vaccine.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

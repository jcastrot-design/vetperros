"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Bell, Trash2, Check, X, Loader2, Clock } from "lucide-react";
import { addReminder, completeReminder, dismissReminder, deleteReminder } from "@/lib/actions/pets";
import { reminderTypeLabels, recurrenceLabels } from "@/lib/validations/pet";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Reminder } from "@/generated/prisma/client";

interface ReminderListProps {
  petId: string;
  reminders: Reminder[];
}

const reminderTypeColors: Record<string, string> = {
  VACCINE: "bg-purple-100 text-purple-700",
  DEWORMING: "bg-orange-100 text-orange-700",
  MEDICATION: "bg-blue-100 text-blue-700",
  GROOMING: "bg-pink-100 text-pink-700",
  CHECKUP: "bg-green-100 text-green-700",
  CUSTOM: "bg-gray-100 text-gray-700",
};

export function ReminderList({ petId, reminders }: ReminderListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reminderType, setReminderType] = useState("CUSTOM");
  const [recurrence, setRecurrence] = useState("NONE");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await addReminder({
      petId,
      type: reminderType,
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      dueDate: form.get("dueDate") as string,
      recurrence,
      notifyBefore: Number(form.get("notifyBefore")) || 3,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Recordatorio creado");
      setOpen(false);
    }
  }

  async function handleComplete(id: string) {
    setActionId(id);
    const result = await completeReminder(id);
    setActionId(null);
    if (result.error) toast.error(result.error);
    else toast.success("Recordatorio completado");
  }

  async function handleDismiss(id: string) {
    setActionId(id);
    const result = await dismissReminder(id);
    setActionId(null);
    if (result.error) toast.error(result.error);
    else toast.success("Recordatorio descartado");
  }

  async function handleDelete(id: string) {
    setActionId(id);
    const result = await deleteReminder(id);
    setActionId(null);
    if (result.error) toast.error(result.error);
    else toast.success("Recordatorio eliminado");
  }

  function isOverdue(date: Date) {
    return new Date(date) < new Date();
  }

  function isDueSoon(date: Date) {
    const d = new Date(date);
    const now = new Date();
    const days7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d > now && d <= days7;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recordatorios ({reminders.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-brand hover:bg-brand-hover" />}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Crear
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear recordatorio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={reminderType} onValueChange={(v) => v && setReminderType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(reminderTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input id="title" name="title" placeholder="Ej: Vacuna rabia" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea id="description" name="description" placeholder="Detalles adicionales..." rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha *</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Repetir</Label>
                  <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(recurrenceLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyBefore">Notificar (dias antes)</Label>
                <Input id="notifyBefore" name="notifyBefore" type="number" min={0} max={30} defaultValue={3} />
              </div>
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear recordatorio
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay recordatorios pendientes</p>
            <p className="text-sm">Crea recordatorios para vacunas, medicamentos y mas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const overdue = isOverdue(reminder.dueDate);
              const soon = isDueSoon(reminder.dueDate);
              return (
                <div
                  key={reminder.id}
                  className={`p-3 border rounded-lg ${
                    overdue ? "border-red-200 bg-red-50/50" :
                    soon ? "border-yellow-200 bg-yellow-50/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{reminder.title}</p>
                        <Badge className={`text-xs ${reminderTypeColors[reminder.type] || ""}`}>
                          {reminderTypeLabels[reminder.type] || reminder.type}
                        </Badge>
                        {overdue && <Badge variant="destructive" className="text-xs">Vencido</Badge>}
                        {soon && !overdue && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pronto</Badge>
                        )}
                      </div>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(reminder.dueDate), "dd MMM yyyy", { locale: es })}
                        </span>
                        <span>
                          ({formatDistanceToNow(new Date(reminder.dueDate), { locale: es, addSuffix: true })})
                        </span>
                      </div>
                      {reminder.description && (
                        <p className="text-xs text-muted-foreground">{reminder.description}</p>
                      )}
                      {reminder.recurrence !== "NONE" && (
                        <p className="text-xs text-muted-foreground">
                          Repite: {recurrenceLabels[reminder.recurrence]}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleComplete(reminder.id)}
                        disabled={actionId === reminder.id}
                        title="Marcar como completado"
                      >
                        {actionId === reminder.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(reminder.id)}
                        disabled={actionId === reminder.id}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

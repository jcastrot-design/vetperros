"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Clock, Save } from "lucide-react";
import { serviceTypeLabels, serviceTypeIcons } from "@/lib/validations/service";
import { updateService, saveAvailability, toggleServiceActive } from "@/lib/actions/services";
import { toast } from "sonner";

const DAYS = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miercoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sabado" },
  { value: "SUNDAY", label: "Domingo" },
];

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ServiceData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  pricePerUnit: number;
  city: string | null;
  isActive: boolean;
  availability: { id: string; dayOfWeek: string; startTime: string; endTime: string }[];
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");

  // Availability state
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services/${serviceId}`);
      if (!res.ok) {
        toast.error("Servicio no encontrado");
        router.push("/provider/services");
        return;
      }
      const data: ServiceData = await res.json();
      setService(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setPrice(String(data.pricePerUnit));
      setCity(data.city || "");
      setSlots(
        data.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })),
      );
      setLoading(false);
    }
    load();
  }, [serviceId, router]);

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateService(serviceId, {
      type: service!.type,
      title,
      description: description || undefined,
      pricePerUnit: Number(price),
      city: city || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Servicio actualizado");
    }
    setSaving(false);
  }

  async function handleSaveAvailability() {
    setSavingAvailability(true);
    const result = await saveAvailability(serviceId, slots);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Disponibilidad guardada");
    }
    setSavingAvailability(false);
  }

  async function handleToggleActive() {
    const result = await toggleServiceActive(serviceId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setService((prev) => prev ? { ...prev, isActive: result.isActive! } : prev);
      toast.success(result.isActive ? "Servicio activado" : "Servicio desactivado");
    }
  }

  function addSlot() {
    setSlots([...slots, { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" }]);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof AvailabilitySlot, value: string) {
    setSlots(slots.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!service) return null;

  const isVet = service.type === "VET_HOME";
  const accent = isVet ? "green" : "orange";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{serviceTypeIcons[service.type]}</span>
          <h1 className="text-2xl font-bold">Editar Servicio</h1>
          <Badge variant="secondary">{serviceTypeLabels[service.type]}</Badge>
        </div>
        <Button
          variant={service.isActive ? "outline" : "default"}
          onClick={handleToggleActive}
          className={!service.isActive ? `bg-${accent}-500 hover:bg-${accent}-600` : ""}
        >
          {service.isActive ? "Desactivar" : "Activar"}
        </Button>
      </div>

      {/* Service details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDetails} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {isVet ? "Precio por visita (CLP)" : "Precio por hora (CLP)"}
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className={`bg-${accent}-500 hover:bg-${accent}-600`}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Guardar Detalles
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidad
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addSlot}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No has definido horarios de disponibilidad.
              <br />
              Agrega tus horarios para que los clientes sepan cuando estas disponible.
            </p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={slot.dayOfWeek}
                    onValueChange={(v) => v && updateSlot(index, "dayOfWeek", v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                    className="w-[120px]"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                    className="w-[120px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSaveAvailability}
            disabled={savingAvailability}
            className={`w-full bg-${accent}-500 hover:bg-${accent}-600`}
          >
            {savingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Guardar Disponibilidad
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => router.push("/provider/services")}>
        Volver a Mis Servicios
      </Button>
    </div>
  );
}

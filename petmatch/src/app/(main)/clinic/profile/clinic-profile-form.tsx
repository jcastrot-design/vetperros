"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { upsertClinicProfile } from "@/lib/actions/clinic";
import { toast } from "sonner";

const COMMON_SERVICES = [
  "Consulta general",
  "Vacunación",
  "Cirugía",
  "Emergencias",
  "Odontología",
  "Dermatología",
  "Radiografía",
  "Ecografía",
  "Laboratorio",
  "Peluquería",
  "Hospitalización",
  "Teleconsulta",
];

interface FormValues {
  name: string;
  address: string;
  phone: string;
  website: string;
  is24h: boolean;
  latitude: string;
  longitude: string;
}

interface Props {
  defaultValues?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    website: string;
    is24h: boolean;
    openingHours: string;
    services: string[];
  };
}

export function ClinicProfileForm({ defaultValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<string[]>(defaultValues?.services ?? []);
  const [customService, setCustomService] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      address: defaultValues?.address ?? "",
      phone: defaultValues?.phone ?? "",
      website: defaultValues?.website ?? "",
      is24h: defaultValues?.is24h ?? false,
      latitude: defaultValues?.latitude?.toString() ?? "-33.4489",
      longitude: defaultValues?.longitude?.toString() ?? "-70.6693",
    },
  });

  const is24h = watch("is24h");

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustomService = () => {
    const trimmed = customService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices((prev) => [...prev, trimmed]);
    }
    setCustomService("");
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const result = await upsertClinicProfile({
      name: values.name,
      address: values.address,
      phone: values.phone || undefined,
      website: values.website || undefined,
      is24h: values.is24h,
      latitude: parseFloat(values.latitude) || -33.4489,
      longitude: parseFloat(values.longitude) || -70.6693,
      services,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil guardado correctamente");
      router.push("/clinic");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre de la clínica *</Label>
            <Input
              {...register("name", { required: true })}
              placeholder="Ej: Clínica Veterinaria San Bernardo"
            />
            {errors.name && <p className="text-xs text-red-500">Requerido</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Dirección *</Label>
            <Input
              {...register("address", { required: true })}
              placeholder="Ej: Av. Providencia 1234, Santiago"
            />
            {errors.address && <p className="text-xs text-red-500">Requerido</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Latitud</Label>
              <Input
                {...register("latitude")}
                placeholder="-33.4489"
                type="number"
                step="any"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Longitud</Label>
              <Input
                {...register("longitude")}
                placeholder="-70.6693"
                type="number"
                step="any"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Puedes obtener las coordenadas desde Google Maps haciendo clic derecho en tu ubicación.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input {...register("phone")} placeholder="+56 9 1234 5678" />
            </div>
            <div className="space-y-1.5">
              <Label>Sitio web</Label>
              <Input {...register("website")} placeholder="https://miclinica.cl" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Switch
              checked={is24h}
              onCheckedChange={(v) => setValue("is24h", v)}
            />
            <Label className="cursor-pointer">Atención 24 horas</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servicios ofrecidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_SERVICES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  services.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-background text-foreground border-border hover:border-blue-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomService())}
              placeholder="Agregar servicio personalizado..."
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={addCustomService}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {services.filter((s) => !COMMON_SERVICES.includes(s)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {services
                .filter((s) => !COMMON_SERVICES.includes(s))
                .map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <button type="button" onClick={() => toggleService(s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/clinic")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar perfil
        </Button>
      </div>
    </form>
  );
}

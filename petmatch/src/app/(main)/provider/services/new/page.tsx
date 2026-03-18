"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { serviceTypeLabels } from "@/lib/validations/service";
import { createService } from "@/lib/actions/services";
import { toast } from "sonner";

const VET_SUBTYPES = ["Consulta General", "Vacunacion", "Urgencias"];

export default function NewServicePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(userRole === "VET" ? "VET_HOME" : "WALK");
  const [title, setTitle] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalizacion");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLoading(false);
        toast.success("Ubicacion detectada");
      },
      () => {
        setGeoLoading(false);
        toast.error("No se pudo obtener la ubicacion");
      },
    );
  }

  // Filter types by role
  const availableTypes = Object.entries(serviceTypeLabels).filter(([key]) => {
    if (key === "VET_HOME") return userRole === "VET" || userRole === "ADMIN";
    return userRole !== "VET";
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createService({
      type,
      title: title || (formData.get("title") as string),
      description: (formData.get("description") as string) || undefined,
      pricePerUnit: Number(formData.get("price")),
      city: (formData.get("city") as string) || undefined,
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Servicio creado");
    router.push("/provider/services");
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de servicio</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "VET_HOME" && (
              <div className="space-y-2">
                <Label>Tipo de atencion</Label>
                <div className="flex flex-wrap gap-2">
                  {VET_SUBTYPES.map((subtype) => (
                    <Button
                      key={subtype}
                      type="button"
                      variant={title === subtype ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTitle(subtype)}
                      className={title === subtype ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {subtype}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "VET_HOME" ? "Ej: Consulta General" : "Ej: Paseo matutino en el parque"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={type === "VET_HOME" ? "Describe el servicio veterinario que ofreces..." : "Describe tu servicio..."}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {type === "VET_HOME" ? "Precio por visita (CLP)" : "Precio por hora (CLP)"}
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                placeholder={type === "VET_HOME" ? "Ej: 25000" : "Ej: 5000"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                placeholder="Ej: Santiago"
              />
            </div>

            <div className="space-y-2">
              <Label>Ubicacion en mapa</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-1.5" />
                  )}
                  Detectar mi ubicacion
                </Button>
                {lat && lng && (
                  <span className="text-xs text-muted-foreground">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Permite que los clientes te encuentren en el mapa
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className={`flex-1 ${type === "VET_HOME" ? "bg-green-500 hover:bg-green-600" : "bg-brand hover:bg-brand-hover"}`}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Servicio
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

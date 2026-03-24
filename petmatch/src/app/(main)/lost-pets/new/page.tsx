"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, SearchX } from "lucide-react";
import { createLostPet } from "@/lib/actions/lost-pets";
import { toast } from "sonner";
import Link from "next/link";

export default function NewLostPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [species, setSpecies] = useState("DOG");
  const [size, setSize] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string)?.trim();
    if (!name) { toast.error("El nombre es obligatorio"); return; }

    const lastSeenAt = form.get("lastSeenAt") as string;
    if (!lastSeenAt) { toast.error("La fecha en que fue visto por última vez es obligatoria"); return; }

    setLoading(true);
    const result = await createLostPet({
      name,
      species,
      breed: (form.get("breed") as string) || undefined,
      color: (form.get("color") as string) || undefined,
      size: size || undefined,
      description: (form.get("description") as string) || undefined,
      lastSeenAt,
      lastSeenAddress: (form.get("lastSeenAddress") as string) || undefined,
      city: (form.get("city") as string) || undefined,
      reward: Number(form.get("reward") || 0) || undefined,
      isUrgent,
    });
    setLoading(false);

    if (result?.error) { toast.error(result.error); return; }
    toast.success("Reporte publicado. ¡Esperamos que lo encuentren pronto!");
    router.push(`/lost-pets/${result.id}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/lost-pets">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <SearchX className="h-5 w-5 text-amber-500" />
            Reportar mascota perdida
          </h1>
          <p className="text-sm text-muted-foreground">Completa la información para que la comunidad pueda ayudarte</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Datos de la mascota</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" placeholder="Ej: Max, Luna..." required />
            </div>

            <div className="space-y-2">
              <Label>Especie <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {[{ value: "DOG", label: "🐶 Perro" }, { value: "CAT", label: "🐱 Gato" }, { value: "OTHER", label: "🐾 Otro" }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setSpecies(opt.value)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${species === opt.value ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700" : "border-border hover:border-amber-300"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Raza</Label>
                <Input id="breed" name="breed" placeholder="Ej: Labrador, Mestizo..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" placeholder="Ej: Café con blanco" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tamaño</Label>
              <Select value={size} onValueChange={(v) => setSize(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">Pequeño</SelectItem>
                  <SelectItem value="MEDIUM">Mediano</SelectItem>
                  <SelectItem value="LARGE">Grande</SelectItem>
                  <SelectItem value="XLARGE">Extra grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción y señas particulares</Label>
              <Textarea id="description" name="description" placeholder="Collar rojo, cojea de la pata derecha, muy amistoso..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Último avistamiento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastSeenAt">Fecha y hora <span className="text-red-500">*</span></Label>
              <Input id="lastSeenAt" name="lastSeenAt" type="datetime-local" required
                defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastSeenAddress">Dirección / lugar</Label>
              <Input id="lastSeenAddress" name="lastSeenAddress" placeholder="Ej: Av. Providencia 1234, Parque..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" placeholder="Ej: Santiago" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Recompensa (CLP)</Label>
              <Input id="reward" name="reward" type="number" min={0} placeholder="0 (opcional)" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Caso urgente</Label>
                <p className="text-xs text-muted-foreground">Destaca el reporte en rojo</p>
              </div>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar reporte
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

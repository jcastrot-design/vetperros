"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, HeartHandshake, X, Plus, ArrowLeft } from "lucide-react";
import { reasonLabels } from "@/lib/validations/adoption";
import { createRescuedAdoptionPost } from "@/lib/actions/adoptions";
import { toast } from "sonner";
import Link from "next/link";

export default function NewAdoptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Pet fields
  const [species, setSpecies] = useState("DOG");
  const [size, setSize] = useState("MEDIUM");
  const [approximateAge, setApproximateAge] = useState("adult");
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);

  // Post fields
  const [reason, setReason] = useState("OTHER");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFosterOnly, setIsFosterOnly] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState("");

  function addRequirement() {
    const val = reqInput.trim();
    if (val && !requirements.includes(val)) {
      setRequirements([...requirements, val]);
    }
    setReqInput("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const petName = (form.get("petName") as string)?.trim();
    if (!petName) {
      toast.error("El nombre de la mascota es obligatorio");
      return;
    }

    setLoading(true);

    const result = await createRescuedAdoptionPost({
      petName,
      species,
      breed: (form.get("breed") as string) || undefined,
      size,
      approximateAge,
      isVaccinated,
      isNeutered,
      reason,
      description: (form.get("description") as string) || undefined,
      city: (form.get("city") as string) || undefined,
      adoptionFee: Number(form.get("adoptionFee") || 0),
      isUrgent,
      isFosterOnly,
      requirements: JSON.stringify(requirements),
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("¡Publicación creada! Esperamos que encuentre un buen hogar.");
    router.push(`/adoption/${result.postId}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/adoption">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-rose-500" />
            Publicar mascota en adopción
          </h1>
          <p className="text-sm text-muted-foreground">Completa la ficha del animal</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* ── DATOS DEL ANIMAL ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos del animal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="petName">Nombre <span className="text-rose-500">*</span></Label>
              <Input id="petName" name="petName" placeholder="Ej: Tobías, Sin nombre..." required />
            </div>

            {/* Especie */}
            <div className="space-y-2">
              <Label>Especie <span className="text-rose-500">*</span></Label>
              <div className="flex gap-2">
                {[
                  { value: "DOG", label: "🐶 Perro" },
                  { value: "CAT", label: "🐱 Gato" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSpecies(opt.value)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      species === opt.value
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600"
                        : "border-border hover:border-rose-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Raza */}
            <div className="space-y-2">
              <Label htmlFor="breed">Raza <span className="text-xs text-muted-foreground">(opcional)</span></Label>
              <Input id="breed" name="breed" placeholder={species === "DOG" ? "Ej: Labrador, Mestizo..." : "Ej: Siamés, Común europeo..."} />
            </div>

            {/* Tamaño y Edad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamaño</Label>
                <Select value={size} onValueChange={(v) => setSize(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">Pequeño</SelectItem>
                    <SelectItem value="MEDIUM">Mediano</SelectItem>
                    <SelectItem value="LARGE">Grande</SelectItem>
                    <SelectItem value="XLARGE">Extra grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Edad aproximada</Label>
                <Select value={approximateAge} onValueChange={(v) => setApproximateAge(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puppy">Cachorro (0–6 meses)</SelectItem>
                    <SelectItem value="young">Joven (6m–2 años)</SelectItem>
                    <SelectItem value="adult">Adulto (2–7 años)</SelectItem>
                    <SelectItem value="senior">Senior (+7 años)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vacunado / Castrado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Vacunado</Label>
                <Switch checked={isVaccinated} onCheckedChange={setIsVaccinated} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Castrado / Esterilizado</Label>
                <Switch checked={isNeutered} onCheckedChange={setIsNeutered} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── DATOS DE LA PUBLICACIÓN ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalles de la adopción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Motivo */}
            <div className="space-y-2">
              <Label>Motivo de la adopción</Label>
              <Select value={reason} onValueChange={(v) => setReason(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Cuéntanos sobre el animal: su personalidad, historia, cosas importantes para el futuro adoptante..."
                rows={4}
              />
            </div>

            {/* Ciudad y fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" placeholder="Ej: Santiago" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adoptionFee">Fee de adopción (CLP)</Label>
                <Input id="adoptionFee" name="adoptionFee" type="number" min={0} placeholder="0" defaultValue={0} />
              </div>
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label>Requisitos para el adoptante</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Tener patio cerrado"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {requirements.map((req, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {req}
                      <button
                        type="button"
                        onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Publicación urgente</Label>
                  <p className="text-xs text-muted-foreground">Destaca con badge naranja</p>
                </div>
                <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Solo hogar de tránsito</Label>
                  <p className="text-xs text-muted-foreground">Busco hogar temporal mientras encuentra familia definitiva</p>
                </div>
                <Switch checked={isFosterOnly} onCheckedChange={setIsFosterOnly} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button
            type="submit"
            className="flex-1 bg-rose-500 hover:bg-rose-600"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

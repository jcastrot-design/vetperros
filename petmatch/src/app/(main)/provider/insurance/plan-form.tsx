"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { createInsurancePlan, updateInsurancePlan } from "@/lib/actions/insurance";
import { toast } from "sonner";

const SPECIES_OPTIONS = [
  { value: "DOG",    label: "🐶 Perros" },
  { value: "CAT",    label: "🐱 Gatos" },
  { value: "BIRD",   label: "🐦 Aves" },
  { value: "RABBIT", label: "🐰 Conejos" },
];

interface PlanFormProps {
  planId?: string;
  defaultValues?: {
    name?: string;
    description?: string;
    price?: number;
    annualPrice?: number;
    coverages?: string[];
    petSpecies?: string[];
    maxAgeMonths?: number;
    deductible?: number;
    maxCoverage?: number;
  };
}

export function PlanForm({ planId, defaultValues = {} }: PlanFormProps) {
  const router = useRouter();
  const isEdit = !!planId;

  const [loading, setLoading]           = useState(false);
  const [name, setName]                 = useState(defaultValues.name ?? "");
  const [description, setDescription]   = useState(defaultValues.description ?? "");
  const [price, setPrice]               = useState(String(defaultValues.price ?? ""));
  const [annualPrice, setAnnualPrice]   = useState(String(defaultValues.annualPrice ?? ""));
  const [maxAgeMonths, setMaxAgeMonths] = useState(String(defaultValues.maxAgeMonths ?? ""));
  const [deductible, setDeductible]     = useState(String(defaultValues.deductible ?? ""));
  const [maxCoverage, setMaxCoverage]   = useState(String(defaultValues.maxCoverage ?? ""));
  const [coverages, setCoverages]       = useState<string[]>(defaultValues.coverages ?? [""]);
  const [petSpecies, setPetSpecies]     = useState<string[]>(defaultValues.petSpecies ?? ["DOG"]);

  function addCoverage() { setCoverages((prev) => [...prev, ""]); }
  function removeCoverage(i: number) { setCoverages((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateCoverage(i: number, val: string) {
    setCoverages((prev) => prev.map((c, idx) => (idx === i ? val : c)));
  }
  function toggleSpecies(species: string) {
    setPetSpecies((prev) =>
      prev.includes(species) ? prev.filter((s) => s !== species) : [...prev, species],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filledCoverages = coverages.filter((c) => c.trim());
    if (filledCoverages.length === 0) { toast.error("Agrega al menos una cobertura"); return; }
    if (petSpecies.length === 0)      { toast.error("Selecciona al menos una especie"); return; }

    setLoading(true);
    const data = {
      name,
      description,
      price:          Number(price),
      annualPrice:    annualPrice ? Number(annualPrice) : undefined,
      coverages:      filledCoverages,
      petSpecies,
      maxAgeMonths:   maxAgeMonths ? Number(maxAgeMonths) : undefined,
      deductible:     deductible   ? Number(deductible)   : undefined,
      maxCoverage:    maxCoverage  ? Number(maxCoverage)  : undefined,
    };

    const res = isEdit
      ? await updateInsurancePlan(planId, data)
      : await createInsurancePlan(data);

    setLoading(false);
    if (res.error) { toast.error(res.error); return; }

    toast.success(isEdit ? "Plan actualizado — quedará en revisión" : "Plan creado — quedará en revisión hasta ser aprobado");
    router.push("/provider/insurance");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Plan de Seguro" : "Crear Nuevo Plan de Seguro"}</CardTitle>
          {!isEdit && (
            <p className="text-sm text-muted-foreground">
              Tu plan quedará en revisión. Un administrador de PetMatch lo aprobará antes de que sea visible para los usuarios.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del plan *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plan Básico Vida" required />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué cubre el plan, para quién es ideal..." rows={3} required />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Precio mensual (CLP) *</Label>
                <Input id="price" type="number" min={1000} value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 9990" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="annualPrice">Precio anual (CLP) <span className="text-muted-foreground">(opcional)</span></Label>
                <Input id="annualPrice" type="number" min={1000} value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)}
                  placeholder="Ej: 99900" />
              </div>
            </div>

            {/* Especies */}
            <div className="space-y-1.5">
              <Label>Especies cubiertas *</Label>
              <div className="flex gap-3 flex-wrap">
                {SPECIES_OPTIONS.map((s) => (
                  <button key={s.value} type="button"
                    onClick={() => toggleSpecies(s.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      petSpecies.includes(s.value)
                        ? "bg-orange-50 border-orange-400 text-orange-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coberturas */}
            <div className="space-y-1.5">
              <Label>Coberturas incluidas *</Label>
              <div className="space-y-2">
                {coverages.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={c} onChange={(e) => updateCoverage(i, e.target.value)}
                      placeholder="Ej: 🏥 Urgencias veterinarias" />
                    {coverages.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCoverage(i)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addCoverage} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Agregar cobertura
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: usa emojis al inicio para hacerlo más visual. Ej: 🏥 Urgencias</p>
            </div>

            {/* Opcionales */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="maxAge">Edad máxima (meses) <span className="text-muted-foreground">(opc.)</span></Label>
                <Input id="maxAge" type="number" min={1} value={maxAgeMonths} onChange={(e) => setMaxAgeMonths(e.target.value)}
                  placeholder="Ej: 96" />
                <p className="text-xs text-muted-foreground">96 = 8 años</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deductible">Deducible (CLP) <span className="text-muted-foreground">(opc.)</span></Label>
                <Input id="deductible" type="number" min={0} value={deductible} onChange={(e) => setDeductible(e.target.value)}
                  placeholder="Ej: 15000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxCoverage">Cobertura máxima (CLP) <span className="text-muted-foreground">(opc.)</span></Label>
                <Input id="maxCoverage" type="number" min={0} value={maxCoverage} onChange={(e) => setMaxCoverage(e.target.value)}
                  placeholder="Ej: 500000" />
              </div>
            </div>

            {/* Comisión info */}
            {price && Number(price) > 0 && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm">
                <p className="font-medium text-orange-800">Resumen de pagos (por póliza/mes)</p>
                <div className="mt-1.5 space-y-0.5 text-orange-700">
                  <div className="flex justify-between">
                    <span>Prima cobrada al usuario</span>
                    <span className="font-semibold">${Number(price).toLocaleString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión PetMatch (15%)</span>
                    <span>-${Math.round(Number(price) * 0.15).toLocaleString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between border-t border-orange-300 pt-1 mt-1 font-bold">
                    <span>Tus ingresos netos</span>
                    <span>${Math.round(Number(price) * 0.85).toLocaleString("es-CL")}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Guardar cambios" : "Crear plan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

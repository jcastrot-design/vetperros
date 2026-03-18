"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import {
  petSpeciesLabels,
  petSizeLabels,
  petSexLabels,
  energyLabels,
  temperamentOptions,
} from "@/lib/validations/pet";
import { createPet, updatePet } from "@/lib/actions/pets";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import type { Pet } from "@/generated/prisma/client";
import { parseJsonArray, toJsonArray } from "@/lib/json-arrays";

interface PetFormProps {
  pet?: Pet;
}

export function PetForm({ pet }: PetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [species, setSpecies] = useState(pet?.species || "DOG");
  const [sex, setSex] = useState(pet?.sex || "");
  const [size, setSize] = useState(pet?.size || "MEDIUM");
  const [energyLevel, setEnergyLevel] = useState(pet?.energyLevel || "MEDIUM");
  const [isVaccinated, setIsVaccinated] = useState(pet?.isVaccinated || false);
  const [isNeutered, setIsNeutered] = useState(pet?.isNeutered || false);
  const [temperament, setTemperament] = useState<string[]>(
    pet ? parseJsonArray(pet.temperament) : [],
  );
  const [allergies, setAllergies] = useState<string[]>(
    pet ? parseJsonArray(pet.allergies) : [],
  );
  const [medicalConditions, setMedicalConditions] = useState<string[]>(
    pet ? parseJsonArray(pet.medicalConditions) : [],
  );
  const [photos, setPhotos] = useState<string[]>(
    pet ? parseJsonArray(pet.photos) : [],
  );
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  function toggleTemperament(value: string) {
    setTemperament((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value],
    );
  }

  function addAllergy() {
    const val = allergyInput.trim();
    if (val && !allergies.includes(val)) {
      setAllergies((prev) => [...prev, val]);
      setAllergyInput("");
    }
  }

  function removeAllergy(val: string) {
    setAllergies((prev) => prev.filter((a) => a !== val));
  }

  function addCondition() {
    const val = conditionInput.trim();
    if (val && !medicalConditions.includes(val)) {
      setMedicalConditions((prev) => [...prev, val]);
      setConditionInput("");
    }
  }

  function removeCondition(val: string) {
    setMedicalConditions((prev) => prev.filter((c) => c !== val));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      species,
      breed: (formData.get("breed") as string) || undefined,
      sex: sex || undefined,
      dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
      size,
      energyLevel,
      temperament: toJsonArray(temperament),
      age: formData.get("age") ? Number(formData.get("age")) : undefined,
      weight: formData.get("weight")
        ? Number(formData.get("weight"))
        : undefined,
      isVaccinated,
      isNeutered,
      microchipId: (formData.get("microchipId") as string) || undefined,
      allergies: toJsonArray(allergies),
      medicalConditions: toJsonArray(medicalConditions),
      diet: (formData.get("diet") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      photos: toJsonArray(photos),
    };

    const result = pet
      ? await updatePet(pet.id, data)
      : await createPet(data);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(pet ? "Mascota actualizada" : "Mascota registrada");
    if (pet) {
      router.push(`/dashboard/pets/${pet.id}`);
    } else {
      router.push("/dashboard/pets");
    }
    router.refresh();
  }

  const dateOfBirthDefault = pet?.dateOfBirth
    ? new Date(pet.dateOfBirth).toISOString().split("T")[0]
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {pet ? "Editar Mascota" : "Registrar Nueva Mascota"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={pet?.name}
                placeholder="Nombre de tu mascota"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de mascota *</Label>
              <Select value={species} onValueChange={(v) => v && setSpecies(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(petSpeciesLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza</Label>
              <Input
                id="breed"
                name="breed"
                defaultValue={pet?.breed || ""}
                placeholder="Ej: Labrador, Mestizo..."
              />
            </div>

            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={sex} onValueChange={(v) => v && setSex(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(petSexLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamano *</Label>
              <Select value={size} onValueChange={(v) => v && setSize(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(petSizeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={dateOfBirthDefault}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad (meses)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                defaultValue={pet?.age || ""}
                placeholder="Ej: 24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min={0}
                step={0.1}
                defaultValue={pet?.weight || ""}
                placeholder="Ej: 15.5"
              />
            </div>
          </div>

          {/* Energy level */}
          <div className="space-y-2">
            <Label>Nivel de energia *</Label>
            <Select value={energyLevel} onValueChange={(v) => v && setEnergyLevel(v)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(energyLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperament */}
          <div className="space-y-2">
            <Label>Temperamento</Label>
            <div className="flex flex-wrap gap-2">
              {temperamentOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    temperament.includes(option) ? "default" : "outline"
                  }
                  className={`cursor-pointer transition-colors ${
                    temperament.includes(option)
                      ? "bg-brand hover:bg-brand-hover"
                      : "hover:bg-orange-50"
                  }`}
                  onClick={() => toggleTemperament(option)}
                >
                  {option}
                  {temperament.includes(option) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Health */}
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="vaccinated"
                checked={isVaccinated}
                onCheckedChange={setIsVaccinated}
              />
              <Label htmlFor="vaccinated">Vacunas al dia</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="neutered"
                checked={isNeutered}
                onCheckedChange={setIsNeutered}
              />
              <Label htmlFor="neutered">Esterilizado/a</Label>
            </div>
          </div>

          {/* Microchip */}
          <div className="space-y-2">
            <Label htmlFor="microchipId">Numero de microchip</Label>
            <Input
              id="microchipId"
              name="microchipId"
              defaultValue={pet?.microchipId || ""}
              placeholder="Ej: 123456789012345"
              className="max-w-xs font-mono"
            />
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label>Alergias</Label>
            <div className="flex gap-2 max-w-md">
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder="Ej: Pollo, Polen..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAllergy();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addAllergy}>
                Agregar
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allergies.map((a) => (
                  <Badge
                    key={a}
                    className="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                    onClick={() => removeAllergy(a)}
                  >
                    {a} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Medical conditions */}
          <div className="space-y-2">
            <Label>Condiciones medicas</Label>
            <div className="flex gap-2 max-w-md">
              <Input
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                placeholder="Ej: Displasia, Epilepsia..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCondition();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCondition}>
                Agregar
              </Button>
            </div>
            {medicalConditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {medicalConditions.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeCondition(c)}
                  >
                    {c} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Diet */}
          <div className="space-y-2">
            <Label htmlFor="diet">Dieta</Label>
            <Input
              id="diet"
              name="diet"
              defaultValue={pet?.diet || ""}
              placeholder="Ej: Royal Canin Medium Adult, 2 veces al dia"
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Fotos de tu mascota</Label>
            <ImageUpload
              value={photos}
              onChange={setPhotos}
              max={5}
              folder="petmatch/pets"
            />
            <p className="text-xs text-muted-foreground">Maximo 5 fotos</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={pet?.description || ""}
              placeholder="Cuenta algo sobre tu mascota..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-hover"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pet ? "Guardar Cambios" : "Registrar Mascota"}
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
  );
}

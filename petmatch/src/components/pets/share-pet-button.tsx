"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface SharePetButtonProps {
  pet: {
    name: string;
    breed: string | null;
    species: string;
    weight: number | null;
    isVaccinated: boolean;
    isNeutered: boolean;
    allergies: string;
    medicalConditions: string;
    dateOfBirth: Date | null;
    age: number | null;
  };
}

export function SharePetButton({ pet }: SharePetButtonProps) {
  const [copied, setCopied] = useState(false);

  function buildSummary() {
    const lines: string[] = [];
    lines.push(`Mascota: ${pet.name}`);
    if (pet.breed) lines.push(`Raza: ${pet.breed}`);
    lines.push(`Especie: ${pet.species}`);
    if (pet.weight) lines.push(`Peso: ${pet.weight} kg`);
    if (pet.dateOfBirth) {
      const months = Math.floor(
        (Date.now() - new Date(pet.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      lines.push(`Edad: ${months < 12 ? `${months} meses` : `${Math.floor(months / 12)} anos`}`);
    } else if (pet.age) {
      lines.push(`Edad: ${pet.age < 12 ? `${pet.age} meses` : `${Math.floor(pet.age / 12)} anos`}`);
    }
    lines.push(`Vacunado: ${pet.isVaccinated ? "Si" : "No"}`);
    lines.push(`Esterilizado: ${pet.isNeutered ? "Si" : "No"}`);

    try {
      const allergies = JSON.parse(pet.allergies) as string[];
      if (allergies.length > 0) lines.push(`Alergias: ${allergies.join(", ")}`);
    } catch { /* empty */ }

    try {
      const conditions = JSON.parse(pet.medicalConditions) as string[];
      if (conditions.length > 0) lines.push(`Condiciones: ${conditions.join(", ")}`);
    } catch { /* empty */ }

    return lines.join("\n");
  }

  async function handleShare() {
    const summary = buildSummary();
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1.5 text-green-500" />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-1.5" />
          Compartir
        </>
      )}
    </Button>
  );
}

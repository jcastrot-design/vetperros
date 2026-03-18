"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Pet } from "@/generated/prisma/client";

interface PetSelectorProps {
  pets: Pet[];
  activePetId: string;
}

export function PetSelector({ pets, activePetId }: PetSelectorProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Buscando como:</span>
      <Select
        value={activePetId}
        onValueChange={(id) => id && router.push(`/match?petId=${id}`)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pets.map((pet) => (
            <SelectItem key={pet.id} value={pet.id}>
              {pet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

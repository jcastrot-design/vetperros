"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { petSpeciesLabels, petSizeLabels, energyLabels } from "@/lib/validations/pet";
import { PawPrint, Pencil, Trash2, Zap, Ruler } from "lucide-react";
import Link from "next/link";
import type { Pet } from "@/generated/prisma/client";
import { parseJsonArray } from "@/lib/json-arrays";

interface PetCardProps {
  pet: Pet;
  onDelete?: (id: string) => void;
}

export function PetCard({ pet, onDelete }: PetCardProps) {
  const photos = parseJsonArray(pet.photos);
  const temperament = parseJsonArray(pet.temperament);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-square relative bg-gradient-to-br from-orange-100 to-amber-50">
        {photos[0] ? (
          <img
            src={photos[0]}
            alt={pet.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <PawPrint className="h-16 w-16 text-orange-300" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-white/90 text-foreground">
          {petSpeciesLabels[pet.species]}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{pet.name}</h3>
          {pet.age && (
            <span className="text-sm text-muted-foreground">
              {pet.age < 12
                ? `${pet.age} meses`
                : `${Math.floor(pet.age / 12)} anos`}
            </span>
          )}
        </div>

        {pet.breed && (
          <p className="text-sm text-muted-foreground">{pet.breed}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            <Ruler className="h-3 w-3 mr-1" />
            {petSizeLabels[pet.size]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {energyLabels[pet.energyLevel]}
          </Badge>
          {pet.isVaccinated && (
            <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
              Vacunado
            </Badge>
          )}
          {pet.isNeutered && (
            <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
              Esterilizado
            </Badge>
          )}
        </div>

        {temperament.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {temperament.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link href={`/dashboard/pets/${pet.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(pet.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

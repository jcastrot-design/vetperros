import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSwipeFeed } from "@/lib/actions/swipes";
import { SwipeDeck } from "@/components/match/swipe-deck";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PawPrint, Heart } from "lucide-react";
import Link from "next/link";
import { PetSelector } from "@/components/match/pet-selector";

export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<{ petId?: string }>;
}) {
  const { petId } = await searchParams;
  const session = await auth();

  const userPets = await prisma.pet.findMany({
    where: { ownerId: session!.user.id },
  });

  if (userPets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PawPrint className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">
          Primero agrega una mascota
        </h3>
        <p className="text-muted-foreground mb-4">
          Necesitas al menos una mascota registrada para usar PetMatch
        </p>
        <Link href="/dashboard/pets/new">
          <Button className="bg-brand hover:bg-brand-hover">
            Agregar Mascota
          </Button>
        </Link>
      </div>
    );
  }

  const activePetId = petId || userPets[0].id;
  const feedPets = await getSwipeFeed(activePetId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            PetMatch
          </h1>
          <p className="text-muted-foreground">
            Encuentra amigos para tu mascota
          </p>
        </div>
        <Link href="/match/matches">
          <Button variant="outline">Ver Matches</Button>
        </Link>
      </div>

      {/* Pet selector */}
      {userPets.length > 1 && (
        <PetSelector pets={userPets} activePetId={activePetId} />
      )}

      {/* Swipe deck */}
      <SwipeDeck pets={feedPets} activePetId={activePetId} />
    </div>
  );
}

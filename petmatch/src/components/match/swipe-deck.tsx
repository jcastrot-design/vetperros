"use client";

import { useState } from "react";
import { SwipeCard } from "./swipe-card";
import { Button } from "@/components/ui/button";
import { X, Heart, PawPrint, Crown } from "lucide-react";
import { createSwipe } from "@/lib/actions/swipes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Pet } from "@/generated/prisma/client";
import Link from "next/link";

interface SwipeDeckProps {
  pets: (Pet & { owner: { name: string; city: string | null } })[];
  activePetId: string;
}

export function SwipeDeck({ pets: initialPets, activePetId }: SwipeDeckProps) {
  const [pets, setPets] = useState(initialPets);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPetName, setMatchedPetName] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  async function handleSwipe(direction: "left" | "right") {
    const currentPet = pets[0];
    if (!currentPet || limitReached) return;

    const action = direction === "right" ? "LIKE" : "PASS";
    const result = await createSwipe(activePetId, currentPet.id, action);

    if (result.error) {
      if ("limitReached" in result && result.limitReached) {
        setLimitReached(true);
        setRemaining(0);
        return;
      }
      toast.error(result.error);
      return;
    }

    if ("remaining" in result && typeof result.remaining === "number") {
      setRemaining(result.remaining);
    }

    if (result.isMatch) {
      setMatchedPetName(currentPet.name);
      setShowMatch(true);
    }

    setPets((prev) => prev.slice(1));
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PawPrint className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">No hay mas mascotas</h3>
        <p className="text-muted-foreground">
          Vuelve mas tarde para ver nuevos perfiles
        </p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <Crown className="h-16 w-16 text-yellow-500 mb-2" />
        <h3 className="text-xl font-bold">Limite diario alcanzado</h3>
        <p className="text-muted-foreground max-w-xs">
          Has usado tus 5 swipes gratuitos de hoy. Mejora a Premium para swipes ilimitados.
        </p>
        <Link href="/dashboard/subscription">
          <Button className="bg-brand hover:bg-brand-hover">
            <Crown className="h-4 w-4 mr-2" />
            Ver planes Premium
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          Tus swipes se renuevan manana a las 00:00
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Swipe counter */}
      {remaining !== null && remaining < Infinity && (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            {remaining} swipe{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      <div className="relative h-[560px] max-w-sm mx-auto">
        {pets.slice(0, 2).map((pet, index) => (
          <SwipeCard
            key={pet.id}
            pet={pet}
            onSwipe={handleSwipe}
            isTop={index === 0}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
        >
          <X className="h-7 w-7 text-red-500" />
        </Button>
        <Button
          size="lg"
          className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Match dialog */}
      <Dialog open={showMatch} onOpenChange={setShowMatch}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">
              <span className="text-pink-500">Es un Match!</span>
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              A tu mascota y a {matchedPetName} les gustaron mutuamente.
              Ahora pueden chatear!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Heart className="h-20 w-20 text-pink-500 fill-pink-500 animate-pulse" />
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setShowMatch(false)}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Seguir buscando
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowMatch(false);
                window.location.href = "/chat";
              }}
            >
              Ir al Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

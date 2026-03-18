import { getMatches } from "@/lib/actions/swipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, PawPrint } from "lucide-react";
import { petSizeLabels } from "@/lib/validations/pet";
import { parseJsonArray } from "@/lib/json-arrays";
import Link from "next/link";

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
          Mis Matches
        </h1>
        <p className="text-muted-foreground">
          Mascotas que hicieron match contigo
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No tienes matches aun</h3>
          <p className="text-muted-foreground mb-4">
            Sigue deslizando para encontrar amigos
          </p>
          <Link href="/match">
            <Button className="bg-pink-500 hover:bg-pink-600">
              Ir a PetMatch
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((pet) => {
            const photos = parseJsonArray(pet.photos);
            return (
            <Card key={pet.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gradient-to-br from-pink-50 to-orange-50">
                {photos[0] ? (
                  <img
                    src={photos[0]}
                    alt={pet.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PawPrint className="h-16 w-16 text-pink-200" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{pet.name}</h3>
                  <Badge variant="secondary">{petSizeLabels[pet.size]}</Badge>
                </div>
                {pet.breed && (
                  <p className="text-sm text-muted-foreground">{pet.breed}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={pet.owner.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {pet.owner.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {pet.owner.name}
                  {pet.owner.city && ` - ${pet.owner.city}`}
                </div>
                <Link href="/chat">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chatear
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}

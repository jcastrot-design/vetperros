"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Zap, Ruler, MapPin } from "lucide-react";
import { petSizeLabels, energyLabels } from "@/lib/validations/pet";
import type { Pet } from "@/generated/prisma/client";
import { parseJsonArray } from "@/lib/json-arrays";

interface SwipeCardProps {
  pet: Pet & { owner: { name: string; city: string | null } };
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export function SwipeCard({ pet, onSwipe, isTop }: SwipeCardProps) {
  const photos = parseJsonArray(pet.photos);
  const temperament = parseJsonArray(pet.temperament);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  }

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={isTop ? {} : { scale: 0.95, y: 10 }}
    >
      <Card className="overflow-hidden shadow-xl max-w-sm mx-auto">
        {/* Photo */}
        <div className="aspect-[3/4] relative bg-gradient-to-br from-orange-100 to-pink-50">
          {photos[0] ? (
            <img
              src={photos[0]}
              alt={pet.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PawPrint className="h-24 w-24 text-orange-200" />
            </div>
          )}

          {/* Swipe indicators */}
          <motion.div
            className="absolute top-6 left-6 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl border-2 border-white rotate-[-12deg]"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl border-2 border-white rotate-[12deg]"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
            <h3 className="text-2xl font-bold text-white">
              {pet.name}
              {pet.age && (
                <span className="font-normal text-lg ml-2">
                  {pet.age < 12
                    ? `${pet.age}m`
                    : `${Math.floor(pet.age / 12)}a`}
                </span>
              )}
            </h3>
            {pet.breed && (
              <p className="text-white/80 text-sm">{pet.breed}</p>
            )}
            {pet.owner.city && (
              <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {pet.owner.city}
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
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
          </div>

          {temperament.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {temperament.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {pet.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pet.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleFavorite, isFavorite } from "@/lib/actions/favorites";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  targetId: string;
  type: "SERVICE" | "PROVIDER";
  className?: string;
}

export function FavoriteButton({ targetId, type, className }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(favorited);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    isFavorite(targetId, type).then(setFavorited);
  }, [targetId, type]);

  function handleToggle() {
    startTransition(async () => {
      setOptimisticFavorited(!optimisticFavorited);
      const result = await toggleFavorite(targetId, type);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        setFavorited(result.isFavorite ?? false);
        toast.success(result.isFavorite ? "Agregado a favoritos" : "Eliminado de favoritos", {
          duration: 2000,
        });
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={className}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={optimisticFavorited ? "filled" : "empty"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              optimisticFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

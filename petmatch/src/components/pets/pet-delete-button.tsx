"use client";

import { PetCard } from "./pet-card";
import { deletePet } from "@/lib/actions/pets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Pet } from "@/generated/prisma/client";

export function PetDeleteButton({ pet }: { pet: Pet }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Estas seguro de que quieres eliminar esta mascota?")) return;
    const result = await deletePet(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Mascota eliminada");
      router.refresh();
    }
  }

  return <PetCard pet={pet} onDelete={handleDelete} />;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PetCard } from "@/components/pets/pet-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint } from "lucide-react";
import Link from "next/link";
import { PetDeleteButton } from "@/components/pets/pet-delete-button";

export default async function PetsPage() {
  const session = await auth();
  const pets = await prisma.pet.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Mascotas</h1>
          <p className="text-muted-foreground">
            Administra los perfiles de tus mascotas
          </p>
        </div>
        <Link href="/dashboard/pets/new">
          <Button className="bg-brand hover:bg-brand-hover">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Mascota
          </Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PawPrint className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No tienes mascotas registradas</h3>
          <p className="text-muted-foreground mb-4">
            Agrega tu primera mascota para comenzar
          </p>
          <Link href="/dashboard/pets/new">
            <Button className="bg-brand hover:bg-brand-hover">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Mascota
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetDeleteButton key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}

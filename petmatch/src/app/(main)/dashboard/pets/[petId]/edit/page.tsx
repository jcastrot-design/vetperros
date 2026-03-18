import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PetForm } from "@/components/pets/pet-form";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const session = await auth();

  const pet = await prisma.pet.findUnique({
    where: { id: petId, ownerId: session!.user.id },
  });

  if (!pet) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <PetForm pet={pet} />
    </div>
  );
}

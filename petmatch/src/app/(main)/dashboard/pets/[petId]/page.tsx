import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PetProfileTabs } from "@/components/pets/pet-profile-tabs";

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const session = await auth();

  const [pet, activeInsurance] = await Promise.all([
    prisma.pet.findUnique({
      where: { id: petId, ownerId: session!.user.id },
      include: {
        vaccines: { orderBy: { dateAdministered: "desc" } },
        medications: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
        reminders: {
          where: { status: { in: ["PENDING", "SENT"] } },
          orderBy: { dueDate: "asc" },
        },
        medicalVisits: { orderBy: { visitDate: "desc" } },
      },
    }),
    prisma.insurancePolicy.findFirst({
      where: { petId, userId: session!.user.id, status: "ACTIVE" },
      select: { id: true },
    }),
  ]);

  if (!pet) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PetProfileTabs pet={pet} hasActiveInsurance={!!activeInsurance} />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OwnerOnboarding } from "@/components/onboarding/owner-onboarding";

export default async function WelcomePage() {
  const session = await auth();
  if (!session) redirect("/signin");

  // If user already has pets, skip onboarding
  const petCount = await prisma.pet.count({
    where: { ownerId: session.user.id },
  });

  if (petCount > 0) {
    redirect("/dashboard");
  }

  return <OwnerOnboarding userName={session.user.name || "amigo"} />;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { ClinicProfileForm } from "./clinic-profile-form";
import { parseJsonArray } from "@/lib/json-arrays";

export default async function ClinicProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "CLINIC") redirect("/dashboard");

  const clinic = await prisma.vetClinic.findUnique({
    where: { userId: session.user.id },
  });

  const defaultValues = clinic
    ? {
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        phone: clinic.phone ?? "",
        website: clinic.website ?? "",
        is24h: clinic.is24h,
        openingHours: clinic.openingHours ?? "",
        services: parseJsonArray(clinic.services) as string[],
      }
    : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-500" />
          {clinic ? "Editar perfil de clínica" : "Configurar clínica"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Esta información aparecerá en el directorio de veterinarias
        </p>
      </div>

      <ClinicProfileForm defaultValues={defaultValues} />
    </div>
  );
}

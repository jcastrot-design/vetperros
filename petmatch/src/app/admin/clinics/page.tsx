import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, Clock, Phone, Globe, MapPin } from "lucide-react";
import { parseJsonArray } from "@/lib/json-arrays";
import { VerifyClinicButtons } from "./verify-clinic-buttons";

export default async function AdminClinicsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const clinics = await prisma.vetClinic.findMany({
    orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
  });

  const verifiedCount = clinics.filter((c) => c.isVerified).length;
  const pendingCount = clinics.length - verifiedCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-500" />
          Veterinarias
        </h1>
        <p className="text-muted-foreground">
          {clinics.length} clínicas · {verifiedCount} verificadas · {pendingCount} pendientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{clinics.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
            <p className="text-sm text-muted-foreground">Verificadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Clinic list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas las clínicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clinics.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay clínicas registradas aún</p>
          )}
          {clinics.map((clinic) => {
            const services = parseJsonArray(clinic.services) as string[];
            return (
              <div key={clinic.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{clinic.name}</p>
                      {clinic.isVerified ? (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verificada
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                          <Clock className="h-3 w-3" />
                          Pendiente
                        </Badge>
                      )}
                      {clinic.is24h && (
                        <Badge variant="secondary">24h</Badge>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {clinic.address}
                      </p>
                      {clinic.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {clinic.phone}
                        </p>
                      )}
                      {clinic.website && (
                        <p className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={clinic.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                          >
                            {clinic.website.replace(/^https?:\/\//, "")}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <VerifyClinicButtons
                    clinicId={clinic.id}
                    isVerified={clinic.isVerified}
                  />
                </div>
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {services.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

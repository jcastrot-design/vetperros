import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MessageCircle, PlusCircle, CheckCircle, AlertCircle, Phone, Globe, Clock } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";

export default async function ClinicDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "CLINIC") redirect("/dashboard");

  const clinic = await prisma.vetClinic.findUnique({
    where: { userId: session.user.id },
  });

  const services = clinic ? parseJsonArray(clinic.services) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            Panel de Clínica
          </h1>
          <p className="text-muted-foreground">
            {clinic ? clinic.name : "Configura tu clínica"}
          </p>
        </div>
        <Link href="/clinic/profile">
          <Button className="bg-brand hover:bg-brand-hover">
            {clinic ? "Editar perfil" : "Configurar clínica"}
          </Button>
        </Link>
      </div>

      {/* Setup alert */}
      {!clinic && (
        <Link href="/clinic/profile">
          <Card className="border-orange-200 bg-orange-50/50 hover:shadow-md transition-shadow">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500 shrink-0" />
              <div>
                <p className="font-medium">Completa el perfil de tu clínica</p>
                <p className="text-sm text-muted-foreground">
                  Agrega los datos de tu veterinaria para aparecer en el directorio
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {clinic && (
        <>
          {/* Verification status */}
          <Card className={clinic.isVerified ? "border-green-200 bg-green-50/30" : "border-yellow-200 bg-yellow-50/30"}>
            <CardContent className="pt-4 flex items-center gap-3">
              {clinic.isVerified ? (
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {clinic.isVerified ? "Clínica verificada" : "Pendiente de verificación"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {clinic.isVerified
                    ? "Tu clínica aparece con el sello de verificación en el directorio"
                    : "El equipo de VetPerros revisará y verificará tu clínica próximamente"}
                </p>
              </div>
              {clinic.isVerified && (
                <Badge className="bg-green-100 text-green-700 ml-auto">Verificada</Badge>
              )}
            </CardContent>
          </Card>

          {/* Clinic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{clinic.address}</span>
                </div>
                {clinic.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {clinic.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{clinic.is24h ? "Atención 24 horas" : "Horario limitado"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Servicios ofrecidos</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {services.map((s: string) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay servicios registrados.{" "}
                    <Link href="/clinic/profile" className="text-blue-500 hover:underline">
                      Agregar servicios
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link href="/clinic/profile">
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Editar perfil
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Mensajes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

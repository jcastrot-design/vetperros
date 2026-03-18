import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import { serviceTypeLabels, serviceTypeIcons } from "@/lib/validations/service";
import Link from "next/link";

export default async function ProviderServicesPage() {
  const session = await auth();

  const services = await prisma.service.findMany({
    where: { providerId: session!.user.id },
    include: { bookings: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Servicios</h1>
        <Link href="/provider/services/new">
          <Button className="bg-brand hover:bg-brand-hover">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No tienes servicios publicados
          </p>
          <Link href="/provider/services/new">
            <Button className="bg-brand hover:bg-brand-hover">
              Crear mi primer servicio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span>{serviceTypeIcons[service.type]}</span>
                    <span className="font-semibold">{service.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {serviceTypeLabels[service.type]}
                    </Badge>
                    {!service.isActive && (
                      <Badge variant="outline" className="text-xs text-red-500">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${service.pricePerUnit.toLocaleString()}/{service.type === "VET_HOME" ? "visita" : "hr"} - {service.bookings.length} reservas
                  </p>
                </div>
                <Link href={`/provider/services/${service.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Editar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, ExternalLink, Shield, Search, Star, Building2, Stethoscope, Video } from "lucide-react";
import { parseJsonArray } from "@/lib/json-arrays";
import { ServiceMap } from "@/components/shared/service-map";
import Link from "next/link";

function isOpenNow(openingHoursStr: string | null): boolean {
  if (!openingHoursStr) return false;
  try {
    const openingHours = JSON.parse(openingHoursStr) as Record<string, { open: string; close: string }>;
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    const day = days[now.getDay()];
    const hours = openingHours[day];
    if (!hours) return false;
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return currentTime >= hours.open && currentTime <= hours.close;
  } catch {
    return false;
  }
}

function formatHours(openingHoursStr: string | null): string | null {
  if (!openingHoursStr) return null;
  try {
    const openingHours = JSON.parse(openingHoursStr) as Record<string, { open: string; close: string }>;
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayLabels = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const now = new Date();
    const day = days[now.getDay()];
    const hours = openingHours[day];
    if (!hours) return "Cerrado hoy";
    return `Hoy: ${hours.open} - ${hours.close}`;
  } catch {
    return null;
  }
}

export default async function VetsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; tab?: string }>;
}) {
  const { filter, q, tab } = await searchParams;
  const activeTab = tab === "domicilio" ? "domicilio" : tab === "teleconsulta" ? "teleconsulta" : "clinicas";

  // Teleconsulta services
  const teleconsultaServices = activeTab === "teleconsulta"
    ? await prisma.service.findMany({
        where: {
          isActive: true,
          type: "TELECONSULTA",
          ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }] } : {}),
        },
        include: {
          provider: {
            include: {
              reviewsReceived: { select: { rating: true } },
              providerProfile: { select: { verificationStatus: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Vet a domicilio services
  const vetHomeServices = activeTab === "domicilio"
    ? await prisma.service.findMany({
        where: {
          isActive: true,
          type: "VET_HOME",
          ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }] } : {}),
        },
        include: {
          provider: {
            include: {
              reviewsReceived: { select: { rating: true } },
              providerProfile: { select: { verificationStatus: true, averageRating: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const clinics = await prisma.vetClinic.findMany({
    where: {
      ...(filter === "24h" ? { is24h: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { address: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  const filteredClinics = filter === "open"
    ? clinics.filter((c) => c.is24h || isOpenNow(c.openingHours))
    : clinics;

  const searchBase = filter ? `filter=${filter}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-green-500" />
          Veterinarias
        </h1>
        <p className="text-muted-foreground">
          Clínicas y veterinarios a domicilio
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-3">
        <Link href={`/vets${q ? `?q=${q}` : ""}`}>
          <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${activeTab === "clinicas" ? "bg-green-500 border-green-500 text-white" : "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800"}`}>
            <Building2 className="h-7 w-7" />
            <span className="text-sm font-semibold text-center">Clínicas</span>
          </div>
        </Link>
        <Link href={`/vets?tab=domicilio${q ? `&q=${q}` : ""}`}>
          <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${activeTab === "domicilio" ? "bg-teal-500 border-teal-500 text-white" : "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/30 dark:border-teal-800"}`}>
            <Stethoscope className="h-7 w-7" />
            <span className="text-sm font-semibold text-center">A domicilio</span>
          </div>
        </Link>
        <Link href={`/vets?tab=teleconsulta${q ? `&q=${q}` : ""}`}>
          <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${activeTab === "teleconsulta" ? "bg-blue-500 border-blue-500 text-white" : "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800"}`}>
            <Video className="h-7 w-7" />
            <span className="text-sm font-semibold text-center">Teleconsulta</span>
          </div>
        </Link>
      </div>

      {/* Search */}
      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          placeholder={activeTab === "clinicas" ? "Buscar por nombre o dirección..." : "Buscar por nombre o ciudad..."}
          defaultValue={q || ""}
          className="pl-10"
        />
        {tab && <input type="hidden" name="tab" value={tab} />}
        {filter && activeTab === "clinicas" && <input type="hidden" name="filter" value={filter} />}
      </form>

      {/* Clinic sub-filters (only in clinicas tab) */}
      {activeTab === "clinicas" && (
        <div className="flex flex-wrap gap-2">
          <Link href={`/vets${q ? `?q=${q}` : ""}`}>
            <Badge variant={!filter ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${!filter ? "bg-green-500" : ""}`}>
              Todas
            </Badge>
          </Link>
          <Link href={`/vets?filter=open${q ? `&q=${q}` : ""}`}>
            <Badge variant={filter === "open" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${filter === "open" ? "bg-green-500" : ""}`}>
              <Clock className="h-3 w-3 mr-1" />
              Abierta ahora
            </Badge>
          </Link>
          <Link href={`/vets?filter=24h${q ? `&q=${q}` : ""}`}>
            <Badge variant={filter === "24h" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${filter === "24h" ? "bg-green-500" : ""}`}>
              <Shield className="h-3 w-3 mr-1" />
              24/7
            </Badge>
          </Link>
          {q && (
            <Link href={`/vets${filter ? `?filter=${filter}` : ""}`}>
              <Badge variant="outline" className="cursor-pointer px-3 py-1.5 text-red-500 border-red-200">
                Limpiar búsqueda
              </Badge>
            </Link>
          )}
        </div>
      )}

      {/* Vet a domicilio tab content */}
      {activeTab === "domicilio" && (
        <>
          <p className="text-sm text-muted-foreground">
            {vetHomeServices.length} veterinario{vetHomeServices.length !== 1 ? "s" : ""} a domicilio
          </p>
          {vetHomeServices.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay veterinarios a domicilio disponibles</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vetHomeServices.map((service) => {
                const reviews = service.provider.reviewsReceived;
                const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
                const isVerified = service.provider.providerProfile?.verificationStatus === "VERIFIED";
                return (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{service.title}</p>
                            <p className="text-sm text-muted-foreground">{service.provider.name}</p>
                          </div>
                          <span className="text-lg font-bold text-teal-600">
                            ${service.pricePerUnit.toLocaleString()}/visita
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {isVerified && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {avgRating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              {avgRating.toFixed(1)} ({reviews.length})
                            </span>
                          )}
                          {service.city && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {service.city}
                            </span>
                          )}
                        </div>
                        <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                          Ver disponibilidad
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Teleconsulta tab content */}
      {activeTab === "teleconsulta" && (
        <>
          <p className="text-sm text-muted-foreground">
            {teleconsultaServices.length} veterinario{teleconsultaServices.length !== 1 ? "s" : ""} con teleconsulta
          </p>
          {teleconsultaServices.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Video className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay veterinarios con teleconsulta disponibles</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teleconsultaServices.map((service) => {
                const reviews = service.provider.reviewsReceived;
                const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
                const isVerified = service.provider.providerProfile?.verificationStatus === "VERIFIED";
                return (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{service.title}</p>
                            <p className="text-sm text-muted-foreground">{service.provider.name}</p>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            ${service.pricePerUnit.toLocaleString()}/consulta
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {isVerified && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {avgRating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              {avgRating.toFixed(1)} ({reviews.length})
                            </span>
                          )}
                        </div>
                        <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                          <Video className="h-3.5 w-3.5 mr-1.5" />
                          Ver disponibilidad
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Map */}
      {activeTab === "clinicas" && filteredClinics.length > 0 && (
        <ServiceMap
          services={filteredClinics
            .filter((c) => c.latitude && c.longitude)
            .map((c) => ({
              id: c.id,
              title: c.name,
              price: 0,
              latitude: c.latitude!,
              longitude: c.longitude!,
              providerName: c.address,
              type: "VET",
            }))}
        />
      )}

      {/* Results count — clinicas tab only */}
      {activeTab === "clinicas" && <p className="text-sm text-muted-foreground">
        {filteredClinics.length} veterinaria{filteredClinics.length !== 1 ? "s" : ""} encontrada{filteredClinics.length !== 1 ? "s" : ""}
        {q && <span> para &ldquo;{q}&rdquo;</span>}
      </p>}

      {/* List — clinicas tab only */}
      {activeTab === "clinicas" && filteredClinics.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Search className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No se encontraron veterinarias
          </p>
          {q && (
            <p className="text-sm text-muted-foreground">
              Intenta con otro nombre o direccion
            </p>
          )}
        </div>
      ) : activeTab === "clinicas" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredClinics.map((clinic) => {
            const hours = formatHours(clinic.openingHours);
            const isOpen = clinic.is24h || isOpenNow(clinic.openingHours);
            return (
              <Card key={clinic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{clinic.name}</h3>
                    <div className="flex gap-1">
                      {clinic.is24h && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          24/7
                        </Badge>
                      )}
                      {clinic.isVerified && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {clinic.address}
                  </p>

                  {clinic.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {clinic.phone}
                    </p>
                  )}

                  {/* Opening hours for today */}
                  {(hours || clinic.is24h) && (
                    <p className={`text-sm flex items-center gap-1 ${isOpen ? "text-green-600" : "text-red-500"}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {clinic.is24h ? "Abierta 24 horas" : hours}
                      {!clinic.is24h && (
                        <Badge variant="outline" className={`ml-1 text-xs ${isOpen ? "border-green-200 text-green-600" : "border-red-200 text-red-500"}`}>
                          {isOpen ? "Abierta" : "Cerrada"}
                        </Badge>
                      )}
                    </p>
                  )}

                  {(() => {
                    const services = parseJsonArray(clinic.services);
                    return services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {services.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  <div className="flex gap-2 pt-1">
                    {clinic.phone && (
                      <a href={`tel:${clinic.phone}`}>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          Llamar
                        </Button>
                      </a>
                    )}
                    {clinic.website && (
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Web
                        </Button>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        Como llegar
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

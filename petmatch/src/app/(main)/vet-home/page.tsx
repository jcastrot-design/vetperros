import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Shield, Search, Stethoscope } from "lucide-react";
import Link from "next/link";
import { StaggerContainer, StaggerItem, PressableCard, FloatingIcon } from "@/components/shared/motion";
import { MapToggle } from "@/components/shared/service-map";

const vetSubTypes = [
  { key: "consulta", label: "Consulta General", match: "Consulta" },
  { key: "vacunacion", label: "Vacunacion", match: "Vacunacion" },
  { key: "urgencias", label: "Urgencias", match: "Urgencias" },
];

export default async function VetHomePage({
  searchParams,
}: {
  searchParams: Promise<{ subtype?: string; city?: string; sort?: string }>;
}) {
  const { subtype, city, sort } = await searchParams;

  const matchText = vetSubTypes.find((s) => s.key === subtype)?.match;

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      type: "VET_HOME",
      ...(matchText ? { title: { contains: matchText } } : {}),
      ...(city ? { city: { contains: city } } : {}),
    },
    include: {
      provider: {
        include: {
          reviewsReceived: { select: { rating: true } },
          providerProfile: {
            select: { verificationStatus: true, trustScore: true },
          },
        },
      },
    },
    orderBy: sort === "price_asc" ? { pricePerUnit: "asc" as const }
      : sort === "price_desc" ? { pricePerUnit: "desc" as const }
      : { createdAt: "desc" as const },
  });

  // Sort by rating post-query
  let sortedServices = services;
  if (sort === "rating") {
    sortedServices = [...services].sort((a, b) => {
      const rA = a.provider.reviewsReceived;
      const rB = b.provider.reviewsReceived;
      const avgA = rA.length > 0 ? rA.reduce((s, r) => s + r.rating, 0) / rA.length : 0;
      const avgB = rB.length > 0 ? rB.reduce((s, r) => s + r.rating, 0) / rB.length : 0;
      return avgB - avgA;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-green-600" />
          Veterinario a Domicilio
        </h1>
        <p className="text-muted-foreground">
          Veterinarios certificados que atienden en tu hogar
        </p>
      </div>

      {/* Search by city */}
      <form className="flex gap-2 max-w-md">
        <Input
          name="city"
          placeholder="Buscar por ciudad..."
          defaultValue={city || ""}
        />
        {subtype && <input type="hidden" name="subtype" value={subtype} />}
        <button
          type="submit"
          className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Sub-type filters */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/vet-home${city ? `?city=${city}` : ""}`}>
          <Badge
            variant={!subtype ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1.5 ${!subtype ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            Todos
          </Badge>
        </Link>
        {vetSubTypes.map((st) => (
          <Link
            key={st.key}
            href={`/vet-home?subtype=${st.key}${city ? `&city=${city}` : ""}`}
          >
            <Badge
              variant={subtype === st.key ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 ${subtype === st.key ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {st.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedServices.length} {sortedServices.length === 1 ? "resultado" : "resultados"}
        </p>
        <div className="flex gap-1">
          {[
            { key: "recent", label: "Recientes" },
            { key: "rating", label: "Mejor valorados" },
            { key: "price_asc", label: "Precio ↑" },
            { key: "price_desc", label: "Precio ↓" },
          ].map((s) => (
            <Link
              key={s.key}
              href={`/vet-home?${new URLSearchParams({
                ...(subtype ? { subtype } : {}),
                ...(city ? { city } : {}),
                ...(s.key !== "recent" ? { sort: s.key } : {}),
              }).toString()}`}
            >
              <Badge
                variant={sort === s.key || (!sort && s.key === "recent") ? "default" : "outline"}
                className={`cursor-pointer text-xs ${sort === s.key || (!sort && s.key === "recent") ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                {s.label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <MapToggle services={sortedServices.map((s) => ({
        id: s.id,
        title: s.title,
        price: s.pricePerUnit,
        latitude: s.latitude || 0,
        longitude: s.longitude || 0,
        providerName: s.provider.name || "",
        type: s.type,
      }))}>
      {sortedServices.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <FloatingIcon>
            <Stethoscope className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          </FloatingIcon>
          <p className="text-lg font-medium">No se encontraron veterinarios a domicilio</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {city
              ? `No hay veterinarios disponibles en "${city}". Intenta buscar en otra ciudad.`
              : "Pronto tendras veterinarios certificados disponibles en tu zona."}
          </p>
          {(subtype || city) && (
            <Link href="/vet-home">
              <Badge variant="outline" className="cursor-pointer px-4 py-2">
                Limpiar filtros
              </Badge>
            </Link>
          )}
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedServices.map((service) => {
            const reviews = service.provider.reviewsReceived;
            const avgRating =
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
            const isVerified =
              service.provider.providerProfile?.verificationStatus === "VERIFIED";

            return (
              <StaggerItem key={service.id}>
                <PressableCard>
                  <Link href={`/services/${service.id}`}>
                    <Card className="cursor-pointer h-full border-green-100">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🩺</span>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-50 text-green-700"
                            >
                              {service.title}
                            </Badge>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            ${service.pricePerUnit.toLocaleString()}/visita
                          </span>
                        </div>

                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Link
                            href={`/providers/${service.providerId}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {service.provider.name}
                          </Link>
                          {isVerified && (
                            <Badge className="bg-green-100 text-green-700 text-xs gap-0.5">
                              <Shield className="h-3 w-3" />
                              Verificado
                            </Badge>
                          )}
                          {avgRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              {avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {service.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {service.city}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </PressableCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
      </MapToggle>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Shield, Search, PlusCircle, Zap, CheckCircle2 } from "lucide-react";
import { serviceTypeLabels, serviceTypeIcons } from "@/lib/validations/service";
import Link from "next/link";
import { ServiceFilters } from "@/components/services/service-filters";
import { FloatingIcon, PressableCard, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { MapToggle } from "@/components/shared/service-map";
import { InsuranceContractButton } from "@/components/insurance/insurance-contract-button";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    city?: string;
    minRating?: string;
    maxPrice?: string;
    verified?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const { type, city, minRating, maxPrice, verified, sort, page } = await searchParams;
  const PAGE_SIZE = 12;

  // Fetch insurance plans from DB when needed
  const insurancePlans = type === "INSURANCE"
    ? await prisma.insurancePlan.findMany({
        where: { approvalStatus: "APPROVED", isActive: true },
        orderBy: { price: "asc" },
      })
    : [];
  const currentPage = Math.max(1, Number(page) || 1);

  const CARE_TYPES = ["SITTING", "DAYCARE", "BOARDING"];
  const typeFilter = type === "CARE"
    ? { type: { in: CARE_TYPES } }
    : type ? { type } : {};

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      ...typeFilter,
      ...(city ? { city: { contains: city } } : {}),
      ...(maxPrice ? { pricePerUnit: { lte: Number(maxPrice) } } : {}),
    },
    include: {
      provider: {
        include: {
          reviewsReceived: { select: { rating: true } },
          providerProfile: {
            select: {
              verificationStatus: true,
              trustScore: true,
              badges: true,
              responseTime: true,
              acceptanceRate: true,
              totalServices: true,
              averageRating: true,
            },
          },
        },
      },
    },
    orderBy: sort === "price_asc" ? { pricePerUnit: "asc" }
      : sort === "price_desc" ? { pricePerUnit: "desc" }
      : { createdAt: "desc" },
  });

  // Helper to compute avg rating
  function getAvgRating(reviews: { rating: number }[]) {
    return reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  }

  // Post-query filters (rating, verified)
  let filtered = services.filter((service) => {
    const avgRating = getAvgRating(service.provider.reviewsReceived);

    if (minRating && avgRating < Number(minRating)) return false;
    if (verified === "true" && service.provider.providerProfile?.verificationStatus !== "VERIFIED") return false;

    return true;
  });

  // Sort by rating (post-query since it's computed)
  if (sort === "rating") {
    filtered = [...filtered].sort((a, b) => {
      const ratingA = getAvgRating(a.provider.reviewsReceived);
      const ratingB = getAvgRating(b.provider.reviewsReceived);
      return ratingB - ratingA;
    });
  }

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Build base params for pagination links
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (minRating) params.set("minRating", minRating);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (verified) params.set("verified", verified);
    if (sort) params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    return `/services?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buscar Servicios</h1>
        <p className="text-muted-foreground">
          Encuentra paseadores, cuidadores y mas para tu mascota
        </p>
      </div>

      {/* Type filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: "", label: "Todos", icon: "🐾", color: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800", active: "bg-orange-500 border-orange-500 text-white" },
            { key: "WALK", label: "Paseo", icon: "🐕", color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800", active: "bg-blue-500 border-blue-500 text-white" },
            { key: "CARE", label: "Cuidado & Hospedaje", icon: "🏡", color: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800", active: "bg-purple-500 border-purple-500 text-white" },
            { key: "GROOMING", label: "Grooming", icon: "✂️", color: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/30 dark:border-pink-800", active: "bg-pink-500 border-pink-500 text-white" },
            { key: "INSURANCE", label: "Seguros", icon: "🛡️", color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800", active: "bg-blue-700 border-blue-700 text-white" },
          ].map(({ key, label, icon, color, active }) => {
            const isActive = key === "" ? !type : type === key;
            const href = key === "" ? "/services" : `/services?type=${key}${city ? `&city=${city}` : ""}${verified ? `&verified=${verified}` : ""}`;
            return (
              <Link key={key} href={href}>
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${isActive ? active : color}`}>
                  <span className="text-3xl leading-none">{icon}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: "TRAINING", label: "Adiestramiento", icon: "🎓", color: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800", active: "bg-green-600 border-green-600 text-white" },
          ].map(({ key, label, icon, color, active }) => {
            const isActive = type === key;
            const href = `/services?type=${key}${city ? `&city=${city}` : ""}${verified ? `&verified=${verified}` : ""}`;
            return (
              <Link key={key} href={href}>
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${isActive ? active : color}`}>
                  <span className="text-3xl leading-none">{icon}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Seguros section */}
      {type === "INSURANCE" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">🛡️ Protege a tu mascota</h2>
              <p className="text-blue-100 text-sm mt-1">Seguros con cobertura real desde $9.990/mes</p>
            </div>
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold shrink-0">Cotizar gratis</Button>
          </div>

          {insurancePlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay planes disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {insurancePlans.map((plan) => {
                const coverages: string[] = JSON.parse(plan.coverages ?? "[]");
                return (
                  <Card key={plan.id} className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.providerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-700">
                            ${plan.price.toLocaleString("es-CL")}
                          </span>
                          <p className="text-xs text-muted-foreground">/ mes</p>
                          {plan.annualPrice && (
                            <p className="text-xs text-blue-600 font-medium">
                              ${plan.annualPrice.toLocaleString("es-CL")}/año
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {coverages.map((c) => (
                          <span key={c} className="text-xs bg-white border rounded-full px-3 py-1">{c}</span>
                        ))}
                      </div>
                      {plan.maxAgeMonths && (
                        <p className="text-xs text-muted-foreground">
                          Edad máxima: {Math.floor(plan.maxAgeMonths / 12)} años
                          {plan.deductible ? ` · Deducible: $${plan.deductible.toLocaleString("es-CL")}` : ""}
                          {plan.maxCoverage ? ` · Cobertura máx: $${plan.maxCoverage.toLocaleString("es-CL")}` : ""}
                        </p>
                      )}
                      <InsuranceContractButton
                        planId={plan.id}
                        planName={plan.name}
                        price={plan.price}
                        annualPrice={plan.annualPrice ?? undefined}
                        isLoggedIn={!!session}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Advanced filters */}
      {type !== "INSURANCE" && <ServiceFilters />}

      {/* Results */}
      {type === "INSURANCE" ? null : <p className="text-sm text-muted-foreground">
        {totalItems} {totalItems === 1 ? "resultado" : "resultados"}
        {totalPages > 1 && ` - Pagina ${currentPage} de ${totalPages}`}
      </p>}
      {type !== "INSURANCE" && <MapToggle services={paginated.map((s) => ({
        id: s.id,
        title: s.title,
        price: s.pricePerUnit,
        latitude: s.latitude || 0,
        longitude: s.longitude || 0,
        providerName: s.provider.name || "",
        type: s.type,
      }))}>
      {paginated.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <FloatingIcon>
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          </FloatingIcon>
          <p className="text-lg font-medium">No se encontraron servicios</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {city ? `No hay servicios disponibles en "${city}". Intenta buscar en otra ciudad.`
              : type ? `No hay servicios de tipo "${serviceTypeLabels[type]}" disponibles.`
              : "No hay servicios disponibles con estos filtros."}
          </p>
          {(type || city || minRating || maxPrice || verified) && (
            <Link href="/services">
              <Button variant="outline">Limpiar filtros</Button>
            </Link>
          )}
          {(session?.user.role === "WALKER" || session?.user.role === "VET") && (
            <div className="pt-4 border-t mt-6">
              <p className="text-sm text-muted-foreground mb-2">
                Eres proveedor? Se el primero en ofrecer servicios
              </p>
              <Link href="/provider/services/new">
                <Button className="bg-brand hover:bg-brand-hover">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Publicar mi servicio
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((service) => {
            const reviews = service.provider.reviewsReceived;
            const avgRating =
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
            const isVerified = service.provider.providerProfile?.verificationStatus === "VERIFIED";
            const profile = service.provider.providerProfile;

            return (
              <StaggerItem key={service.id}>
              <PressableCard>
              <Link href={`/services/${service.id}`}>
                <Card className="cursor-pointer h-full">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl">
                          {serviceTypeIcons[service.type]}
                        </span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {serviceTypeLabels[service.type]}
                        </Badge>
                      </div>
                      <span className={`text-lg font-bold ${service.type === "VET_HOME" ? "text-green-600" : "text-orange-600"}`}>
                        ${service.pricePerUnit.toLocaleString()}/{service.type === "VET_HOME" ? "visita" : "hr"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg">{service.title}</h3>

                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {service.provider.name}
                      </span>
                      {isVerified && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-700">
                          <Shield className="h-3 w-3 mr-0.5" />
                          Verificado
                        </Badge>
                      )}
                      {avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {avgRating.toFixed(1)} ({reviews.length})
                        </span>
                      )}
                    </div>

                    {/* Provider metrics */}
                    {profile && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {profile.responseTime !== null && profile.responseTime > 0 && profile.responseTime < 60 && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            ~{profile.responseTime} min
                          </span>
                        )}
                        {profile.acceptanceRate !== null && profile.acceptanceRate > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {profile.acceptanceRate}%
                          </span>
                        )}
                        {profile.totalServices !== null && profile.totalServices > 0 && (
                          <span>{profile.totalServices} servicios</span>
                        )}
                      </div>
                    )}

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <Link href={pageUrl(currentPage - 1)}>
              <Button variant="outline" size="sm">Anterior</Button>
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-muted-foreground px-1">...</span>
                )}
                <Link href={pageUrl(p)}>
                  <Button
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    className={p === currentPage ? "bg-brand hover:bg-brand-hover" : ""}
                  >
                    {p}
                  </Button>
                </Link>
              </span>
            ))}
          {currentPage < totalPages && (
            <Link href={pageUrl(currentPage + 1)}>
              <Button variant="outline" size="sm">Siguiente</Button>
            </Link>
          )}
        </div>
      )}
      </MapToggle>}
    </div>
  );
}

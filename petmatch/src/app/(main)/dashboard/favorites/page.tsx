import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { serviceTypeLabels, serviceTypeIcons } from "@/lib/validations/service";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await auth();

  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serviceIds = favorites.filter((f) => f.serviceId).map((f) => f.serviceId!);
  const providerIds = favorites.filter((f) => f.providerId).map((f) => f.providerId!);

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    include: {
      provider: {
        include: { reviewsReceived: { select: { rating: true } } },
      },
    },
  });

  const providers = await prisma.user.findMany({
    where: { id: { in: providerIds } },
    include: {
      providerProfile: { include: { badges: true } },
      reviewsReceived: { select: { rating: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favoritos</h1>
        <p className="text-muted-foreground">{favorites.length} favoritos guardados</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No tienes favoritos aun"
          description="Explora servicios y proveedores, y marcalos con un corazon para encontrarlos facilmente aqui."
          actions={[
            { label: "Buscar servicios", href: "/services" },
            { label: "Explorar veterinarios", href: "/vet-home", variant: "outline" },
          ]}
        />
      ) : (
        <div className="space-y-6">
          {services.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Servicios</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => {
                  const reviews = service.provider.reviewsReceived;
                  const avgRating = reviews.length > 0
                    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                    : 0;

                  return (
                    <Link key={service.id} href={`/services/${service.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <span>{serviceTypeIcons[service.type]}</span>
                              <Badge variant="secondary" className="text-xs">
                                {serviceTypeLabels[service.type]}
                              </Badge>
                            </div>
                            <span className="font-bold text-orange-600">
                              ${service.pricePerUnit.toLocaleString()}/hr
                            </span>
                          </div>
                          <p className="font-medium">{service.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{service.provider.name}</span>
                            {avgRating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                {avgRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {providers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Proveedores</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {providers.map((provider) => {
                  const avgRating = provider.reviewsReceived.length > 0
                    ? provider.reviewsReceived.reduce((s, r) => s + r.rating, 0) / provider.reviewsReceived.length
                    : 0;

                  return (
                    <Link key={provider.id} href={`/providers/${provider.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            {provider.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {avgRating > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  {avgRating.toFixed(1)}
                                </span>
                              )}
                              {provider.city && <span>{provider.city}</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

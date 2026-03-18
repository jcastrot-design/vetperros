import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Shield } from "lucide-react";
import { serviceTypeLabels, serviceTypeIcons } from "@/lib/validations/service";
import { FavoriteButton } from "@/components/shared/favorite-button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const dayLabels: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miercoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sabado",
  SUNDAY: "Domingo",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const session = await auth();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        include: {
          reviewsReceived: {
            include: { author: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          providerProfile: {
            select: { verificationStatus: true, trustScore: true, displayName: true },
          },
        },
      },
      availability: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!service) notFound();

  const reviews = service.provider.reviewsReceived;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const isVerified = service.provider.providerProfile?.verificationStatus === "VERIFIED";

  const initials = service.provider.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Service header */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">
                  {serviceTypeIcons[service.type]}
                </span>
                <Badge variant="secondary">
                  {serviceTypeLabels[service.type]}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{service.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {session && <FavoriteButton targetId={service.id} type="SERVICE" />}
              <div className="text-right">
                <span className={`text-3xl font-bold ${service.type === "VET_HOME" ? "text-green-600" : "text-orange-600"}`}>
                  ${service.pricePerUnit.toLocaleString()}
                </span>
                <p className="text-sm text-muted-foreground">
                  {service.type === "VET_HOME" ? "por visita" : "por hora"}
                </p>
              </div>
            </div>
          </div>

          {service.description && (
            <p className="text-muted-foreground">{service.description}</p>
          )}

          {service.city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {service.city}
            </div>
          )}

          <Link href={`/services/${service.id}/book`}>
            <Button
              size="lg"
              className={`w-full mt-2 ${service.type === "VET_HOME" ? "bg-green-500 hover:bg-green-600" : "bg-brand hover:bg-brand-hover"}`}
            >
              Reservar Servicio
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/providers/${service.providerId}`} className="block">
            <div className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
              <Avatar className="h-14 w-14">
                <AvatarImage src={service.provider.avatarUrl || undefined} />
                <AvatarFallback className="bg-orange-100 text-orange-700 text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{service.provider.name}</p>
                  {isVerified && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {avgRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {avgRating.toFixed(1)} ({reviews.length} resenas)
                    </span>
                  )}
                  {service.provider.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {service.provider.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
          {service.provider.bio && (
            <p className="text-sm text-muted-foreground">
              {service.provider.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      {service.availability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {service.availability.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="font-medium">
                    {dayLabels[slot.dayOfWeek]}
                  </span>
                  <span className="text-muted-foreground">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Resenas ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aun no hay resenas para este servicio
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {review.author.name}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  {/* Sub-ratings */}
                  {(review.punctualityRating || review.careRating || review.communicationRating) && (
                    <div className="flex gap-3 text-xs text-muted-foreground mb-1">
                      {review.punctualityRating && <span>Puntualidad: {review.punctualityRating}/5</span>}
                      {review.careRating && <span>Cuidado: {review.careRating}/5</span>}
                      {review.communicationRating && <span>Comunicacion: {review.communicationRating}/5</span>}
                    </div>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                  {review.response && (
                    <div className="mt-2 ml-4 p-2 bg-muted rounded text-sm">
                      <p className="font-medium text-xs mb-1">Respuesta del proveedor:</p>
                      <p>{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

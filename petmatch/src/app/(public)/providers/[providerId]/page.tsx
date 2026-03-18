import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star, Shield, MapPin, Clock, Award, Briefcase, CalendarDays, LogIn, ArrowLeft,
} from "lucide-react";
import { providerTypeLabels, badgeTypeLabels } from "@/lib/validations/provider";
import { serviceTypeLabels } from "@/lib/validations/service";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProviderContactButton } from "@/components/providers/provider-contact-button";

export default async function ProviderPublicProfile({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const session = await auth();

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    include: {
      badges: true,
      user: {
        select: { name: true, avatarUrl: true, city: true, createdAt: true },
      },
    },
  });

  if (!profile || !profile.isActive) notFound();

  const reviews = await prisma.review.findMany({
    where: { targetId: providerId },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      booking: { include: { service: { select: { type: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const services = await prisma.service.findMany({
    where: { providerId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const initials = profile.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avgPunctuality = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.punctualityRating || 0), 0) / reviews.filter((r) => r.punctualityRating).length || 0)
    : 0;
  const avgCare = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.careRating || 0), 0) / reviews.filter((r) => r.careRating).length || 0)
    : 0;
  const avgComm = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.communicationRating || 0), 0) / reviews.filter((r) => r.communicationRating).length || 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Nav bar */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        {!session && (
          <Link href="/signin">
            <Button size="sm" variant="outline">
              <LogIn className="h-4 w-4 mr-1" />
              Iniciar sesion
            </Button>
          </Link>
        )}
        {session && (
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Mi panel
            </Button>
          </Link>
        )}
      </div>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.user.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                {profile.verificationStatus === "VERIFIED" && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {providerTypeLabels[profile.type]}
                {profile.user.city && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.user.city}
                  </span>
                )}
              </p>

              {/* Stats */}
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>{profile.totalServices} servicios</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Desde {format(new Date(profile.createdAt), "MMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {profile.badges.map((badge) => (
                    <Badge key={badge.id} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {badgeTypeLabels[badge.type] || badge.type}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Trust score */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confianza:</span>
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${profile.trustScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{profile.trustScore}%</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons — authenticated users */}
          {session && session.user.id !== providerId && (
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <ProviderContactButton providerId={providerId} />
              {services.length > 0 && (
                <Link href={`/services/${services[0].id}/book`} className="flex-1">
                  <Button className="w-full bg-brand hover:bg-brand-hover">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Reservar
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* CTA — unauthenticated visitors */}
          {!session && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/signin">
                <Button className="w-full" variant="outline">
                  <LogIn className="h-4 w-4 mr-2" />
                  Inicia sesion para contactar o reservar
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre mi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{profile.bio}</p>
            {profile.experience && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Experiencia</p>
                <p className="whitespace-pre-line">{profile.experience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Servicios ({services.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceTypeLabels[service.type]}
                    </p>
                  </div>
                  <p className="font-semibold text-orange-600">
                    ${service.pricePerUnit.toLocaleString()}/hr
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Resenas ({reviews.length})
          </CardTitle>
          {/* Sub-rating averages */}
          {reviews.some((r) => r.punctualityRating) && (
            <div className="flex gap-4 text-sm mt-2">
              {avgPunctuality > 0 && (
                <span>Puntualidad: <strong>{avgPunctuality.toFixed(1)}</strong></span>
              )}
              {avgCare > 0 && (
                <span>Cuidado: <strong>{avgCare.toFixed(1)}</strong></span>
              )}
              {avgComm > 0 && (
                <span>Comunicacion: <strong>{avgComm.toFixed(1)}</strong></span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aun no hay resenas</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.author.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
                          }`}
                        />
                      ))}
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
                  {review.comment && <p className="text-sm">{review.comment}</p>}
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

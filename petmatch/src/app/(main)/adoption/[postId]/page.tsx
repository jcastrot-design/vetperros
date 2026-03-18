import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HeartHandshake, AlertCircle, CheckCircle, XCircle, MapPin, CalendarDays, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { reasonLabels, applicationStatusLabels } from "@/lib/validations/adoption";
import { differenceInMonths, differenceInYears, format } from "date-fns";
import { es } from "date-fns/locale";
import { ApplyButton } from "@/components/adoption/apply-button";

export default async function AdoptionDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const session = await auth();

  const post = await prisma.adoptionPost.findUnique({
    where: { id: postId },
    include: {
      pet: true,
      poster: { select: { id: true, name: true, avatarUrl: true, city: true, createdAt: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!post || post.status === "CANCELLED") notFound();

  // Increment view count (fire and forget)
  prisma.adoptionPost
    .update({ where: { id: postId }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Check if current user has already applied
  let myApplication = null;
  if (session && session.user.id !== post.posterId) {
    myApplication = await prisma.adoptionApplication.findUnique({
      where: { postId_applicantId: { postId, applicantId: session.user.id } },
    });
  }

  const photos = parseJsonArray(post.pet.photos);
  const requirements = parseJsonArray(post.requirements);

  function petAge(dob: Date | null) {
    if (!dob) return null;
    const years = differenceInYears(new Date(), dob);
    if (years > 0) return `${years} ${years === 1 ? "año" : "años"}`;
    const months = differenceInMonths(new Date(), dob);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  const age = petAge(post.pet.dateOfBirth);
  const sizeLabels: Record<string, string> = { SMALL: "Pequeño", MEDIUM: "Mediano", LARGE: "Grande", XLARGE: "Extra grande" };
  const isOwner = session?.user.id === post.posterId;
  const isAdopted = post.status === "ADOPTED";
  const isPaused = post.status === "PAUSED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/adoption" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a adopciones
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fotos */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            {photos[0] ? (
              <img src={photos[0]} alt={post.pet.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-8xl">{post.pet.species === "DOG" ? "🐶" : "🐱"}</span>
            )}
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(1, 4).map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={photo} alt="" className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                {post.isUrgent && (
                  <Badge className="bg-amber-500 text-white">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Urgente
                  </Badge>
                )}
                {post.isFosterOnly && <Badge variant="secondary">Solo tránsito</Badge>}
                {isAdopted && <Badge className="bg-green-600 text-white">Adoptado ✓</Badge>}
                {isPaused && <Badge variant="outline">Pausada</Badge>}
              </div>
              <h1 className="text-3xl font-bold">{post.pet.name}</h1>
              {post.pet.breed && <p className="text-muted-foreground">{post.pet.breed}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-rose-600">
                {post.adoptionFee > 0 ? `$${post.adoptionFee.toLocaleString("es-CL")}` : "Sin costo"}
              </p>
            </div>
          </div>

          {/* Badges de características */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{post.pet.species === "DOG" ? "🐶 Perro" : "🐱 Gato"}</Badge>
            {post.pet.sex && <Badge variant="outline">{post.pet.sex === "MALE" ? "♂ Macho" : "♀ Hembra"}</Badge>}
            {post.pet.size && <Badge variant="outline">{sizeLabels[post.pet.size]}</Badge>}
            {age && <Badge variant="outline">🎂 {age}</Badge>}
            {post.pet.isVaccinated && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Vacunado
              </Badge>
            )}
            {post.pet.isNeutered && (
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Esterilizado
              </Badge>
            )}
          </div>

          {/* Motivo */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Motivo:</span> {reasonLabels[post.reason]}
          </div>

          {/* Descripción */}
          {(post.description || post.pet.description) && (
            <div className="space-y-1">
              <p className="font-medium text-sm">Sobre {post.pet.name}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.description || post.pet.description}
              </p>
            </div>
          )}

          {/* Requisitos */}
          {requirements.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Requisitos del adoptante</p>
              <ul className="space-y-1">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Publicado por */}
          <Card className="bg-muted/40">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.poster.avatarUrl || ""} />
                  <AvatarFallback>{post.poster.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{post.poster.name}</p>
                  {(post.poster.city || post.city) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {post.poster.city || post.city}
                    </p>
                  )}
                </div>
                <div className="ml-auto text-right text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 inline mr-1" />
                  {format(post.createdAt, "d MMM yyyy", { locale: es })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          {!isOwner && !isAdopted && !isPaused && (
            <div className="pt-2">
              {myApplication ? (
                <div className="rounded-lg border p-4 text-center space-y-1">
                  <p className="font-medium">
                    {myApplication.status === "APPROVED" ? "🎉 ¡Solicitud aprobada!" :
                     myApplication.status === "REJECTED" ? "Solicitud no seleccionada" :
                     myApplication.status === "WITHDRAWN" ? "Solicitud retirada" :
                     "Solicitud enviada"}
                  </p>
                  <Badge variant="secondary">{applicationStatusLabels[myApplication.status]}</Badge>
                  {myApplication.status === "APPROVED" && myApplication.conversationId && (
                    <div className="pt-2">
                      <Link href={`/chat/${myApplication.conversationId}`}>
                        <Button className="w-full bg-rose-500 hover:bg-rose-600">Ir al chat con el dueño</Button>
                      </Link>
                    </div>
                  )}
                  {myApplication.status === "PENDING" && (
                    <p className="text-xs text-muted-foreground">El dueño revisará tu solicitud pronto.</p>
                  )}
                </div>
              ) : session ? (
                <ApplyButton postId={postId} petName={post.pet.name} />
              ) : (
                <Link href="/signin">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    Iniciar sesión para solicitar adopción
                  </Button>
                </Link>
              )}
            </div>
          )}

          {isOwner && (
            <div className="pt-2 flex gap-2">
              <Link href={`/adoption/my-posts/${postId}`} className="flex-1">
                <Button variant="outline" className="w-full">Gestionar publicación</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

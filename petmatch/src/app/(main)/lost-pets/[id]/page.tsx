import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, AlertCircle, Eye, MessageCircle, CheckCircle2, DollarSign } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReportSightingButton } from "./report-sighting-button";
import { UpdateStatusButton } from "./update-status-button";

const statusLabels: Record<string, string> = { LOST: "Perdido", FOUND: "Encontrado", REUNITED: "Reunido" };
const statusColors: Record<string, string> = {
  LOST: "bg-red-100 text-red-700 border-red-200",
  FOUND: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REUNITED: "bg-green-100 text-green-700 border-green-200",
};
const speciesLabels: Record<string, string> = { DOG: "Perro", CAT: "Gato", OTHER: "Otro" };
const sizeLabels: Record<string, string> = { SMALL: "Pequeño", MEDIUM: "Mediano", LARGE: "Grande", XLARGE: "Extra grande" };

export default async function LostPetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.lostPet.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      sightings: {
        include: { reporter: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!post) notFound();

  // Increment view count (fire and forget)
  prisma.lostPet.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const photos = parseJsonArray(post.photos);
  const isOwner = session?.user.id === post.owner.id;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/lost-pets">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold">{post.name}</h1>
      </div>

      {/* Photo / header */}
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
        {photos[0] ? (
          <img src={photos[0]} alt={post.name} className="object-cover w-full h-full" />
        ) : (
          <span className="text-8xl">{post.species === "DOG" ? "🐶" : post.species === "CAT" ? "🐱" : "🐾"}</span>
        )}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[post.status]}`}>
            {statusLabels[post.status]}
          </span>
          {post.isUrgent && (
            <Badge className="bg-red-500 text-white">
              <AlertCircle className="h-3 w-3 mr-1" />Urgente
            </Badge>
          )}
        </div>
        {post.reward && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-amber-500 text-white">
              <DollarSign className="h-3 w-3 mr-0.5" />
              Recompensa ${post.reward.toLocaleString("es-CL")}
            </Badge>
          </div>
        )}
      </div>

      {/* Main info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div><span className="text-muted-foreground">Especie</span><p className="font-medium">{speciesLabels[post.species]}</p></div>
            {post.breed && <div><span className="text-muted-foreground">Raza</span><p className="font-medium">{post.breed}</p></div>}
            {post.color && <div><span className="text-muted-foreground">Color</span><p className="font-medium">{post.color}</p></div>}
            {post.size && <div><span className="text-muted-foreground">Tamaño</span><p className="font-medium">{sizeLabels[post.size] || post.size}</p></div>}
          </div>
          {post.description && (
            <div className="pt-1">
              <span className="text-muted-foreground">Descripción</span>
              <p className="mt-0.5">{post.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last seen */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Último avistamiento</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(post.lastSeenAt, "d 'de' MMMM yyyy, HH:mm", { locale: es })}</span>
          </div>
          {(post.lastSeenAddress || post.city) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{[post.lastSeenAddress, post.city].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats + actions */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.viewCount} vistas</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{post.sightings.length} avistamiento{post.sightings.length !== 1 ? "s" : ""}</span>
        </div>
        <span>Publicado por {post.owner.name}</span>
      </div>

      {/* Action buttons */}
      {session && !isOwner && post.status !== "REUNITED" && (
        <ReportSightingButton lostPetId={post.id} />
      )}
      {isOwner && post.status !== "REUNITED" && (
        <UpdateStatusButton lostPetId={post.id} currentStatus={post.status} />
      )}

      {/* Sightings */}
      {post.sightings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Avistamientos reportados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {post.sightings.map((s) => (
              <div key={s.id} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{s.reporter.name}</span>
                  <span>{format(s.createdAt, "d MMM yyyy, HH:mm", { locale: es })}</span>
                </div>
                {s.address && (
                  <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />{s.address}
                  </p>
                )}
                {s.description && <p className="text-sm">{s.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

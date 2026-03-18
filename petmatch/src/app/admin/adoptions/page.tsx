import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, PawPrint, Users, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { postStatusLabels, postStatusColors } from "@/lib/validations/adoption";
import { parseJsonArray } from "@/lib/json-arrays";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AdminAdoptionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [posts, totalApps, adoptedCount, urgentCount] = await Promise.all([
    prisma.adoptionPost.findMany({
      include: {
        pet: { select: { name: true, species: true, photos: true } },
        poster: { select: { name: true, email: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.adoptionApplication.count(),
    prisma.adoptionPost.count({ where: { status: "ADOPTED" } }),
    prisma.adoptionPost.count({ where: { status: "ACTIVE", isUrgent: true } }),
  ]);

  const activeCount = posts.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-rose-500" />
          Adopciones
        </h1>
        <p className="text-muted-foreground">Moderación de publicaciones de adopción</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Total publicaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-rose-600">{adoptedCount}</p>
            <p className="text-sm text-muted-foreground">Adoptadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalApps}</p>
            <p className="text-sm text-muted-foreground">Solicitudes totales</p>
          </CardContent>
        </Card>
      </div>

      {urgentCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-800 dark:text-amber-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{urgentCount} publicación{urgentCount !== 1 ? "es" : ""} urgente{urgentCount !== 1 ? "s" : ""} activa{urgentCount !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas las publicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.map((post) => {
              const photos = parseJsonArray(post.pet.photos);
              return (
                <div key={post.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {photos[0] ? (
                      <img src={photos[0]} alt={post.pet.name} className="object-cover w-full h-full" />
                    ) : (
                      <span>{post.pet.species === "DOG" ? "🐶" : "🐱"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/adoption/${post.id}`}
                        className="font-medium text-sm hover:text-rose-500 transition-colors"
                      >
                        {post.pet.name}
                      </Link>
                      <Badge
                        variant={postStatusColors[post.status] as "default" | "secondary" | "destructive" | "outline"}
                        className="text-xs"
                      >
                        {postStatusLabels[post.status]}
                      </Badge>
                      {post.isUrgent && (
                        <Badge className="bg-amber-500 text-white text-xs">Urgente</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.poster.name} · {post.poster.email}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground space-y-0.5">
                    <p className="flex items-center gap-1 justify-end">
                      <Users className="h-3 w-3" />
                      {post._count.applications}
                    </p>
                    <p className="flex items-center gap-1 justify-end">
                      <Eye className="h-3 w-3" />
                      {post.viewCount}
                    </p>
                    <p>{format(post.createdAt, "d MMM", { locale: es })}</p>
                  </div>
                </div>
              );
            })}
            {posts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay publicaciones aún</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

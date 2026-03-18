import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX, PlusCircle, MapPin, Eye, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { differenceInHours, differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";

const statusLabels: Record<string, string> = { LOST: "Perdido", FOUND: "Encontrado", REUNITED: "Reunido" };
const statusColors: Record<string, string> = {
  LOST: "bg-red-100 text-red-700 border-red-200",
  FOUND: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REUNITED: "bg-green-100 text-green-700 border-green-200",
};
const speciesLabels: Record<string, string> = { DOG: "Perro", CAT: "Gato", OTHER: "Otro" };

function timeAgo(date: Date) {
  const hours = Math.max(0, differenceInHours(new Date(), date));
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.max(1, differenceInDays(new Date(), date));
  return `Hace ${days} día${days !== 1 ? "s" : ""}`;
}

export default async function LostPetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; species?: string; city?: string; status?: string }>;
}) {
  const session = await auth();
  const { q, species, city, status } = await searchParams;

  const activeStatus = status || "LOST";

  const cityRows = await prisma.lostPet.findMany({
    where: { city: { not: null } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const cities = cityRows.map((r) => r.city as string).filter(Boolean);

  const posts = await prisma.lostPet.findMany({
    where: {
      status: activeStatus,
      ...(species ? { species } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { breed: { contains: q, mode: "insensitive" } },
          { color: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      owner: { select: { name: true } },
      _count: { select: { sightings: true } },
    },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SearchX className="h-6 w-6 text-amber-500" />
            Mascotas perdidas
          </h1>
          <p className="text-muted-foreground">Ayuda a reunir mascotas con sus familias</p>
        </div>
        {session && (
          <Link href="/lost-pets/new">
            <Button className="bg-amber-500 hover:bg-amber-600">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Reportar mascota perdida
            </Button>
          </Link>
        )}
      </div>

      {/* Accesos rápidos */}
      {session && (
        <Link href="/lost-pets/my-reports">
          <div className="flex items-center gap-2 p-3 rounded-lg border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-colors cursor-pointer w-fit">
            <SearchX className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Mis reportes</span>
          </div>
        </Link>
      )}

      {/* Tabs de estado */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "LOST", label: "Perdidas", icon: "🔴" },
          { key: "FOUND", label: "Encontradas", icon: "🟡" },
          { key: "REUNITED", label: "Reunidas", icon: "🟢" },
        ].map(({ key, label, icon }) => (
          <Link key={key} href={`/lost-pets?status=${key}${species ? `&species=${species}` : ""}${city ? `&city=${city}` : ""}`}>
            <Badge
              variant={activeStatus === key ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 text-sm ${activeStatus === key ? "bg-amber-500 border-amber-500" : ""}`}
            >
              {icon} {label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Búsqueda + ciudad */}
      <form className="flex flex-wrap gap-2 max-w-xl">
        <Input name="q" placeholder="Buscar por nombre, raza o color..." defaultValue={q || ""} className="flex-1 min-w-40" />
        {cities.length > 0 && (
          <select
            name="city"
            defaultValue={city || ""}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <input type="hidden" name="status" value={activeStatus} />
        {species && <input type="hidden" name="species" value={species} />}
        <button type="submit" className="px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm">
          Buscar
        </button>
      </form>

      {/* Filtros especie */}
      <div className="flex gap-2 flex-wrap">
        <Link href={`/lost-pets?status=${activeStatus}${city ? `&city=${city}` : ""}`}>
          <Badge variant={!species ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${!species ? "bg-amber-500" : ""}`}>
            🐾 Todos
          </Badge>
        </Link>
        {[{ key: "DOG", label: "Perros", icon: "🐶" }, { key: "CAT", label: "Gatos", icon: "🐱" }].map(({ key, label, icon }) => (
          <Link key={key} href={`/lost-pets?status=${activeStatus}&species=${key}${city ? `&city=${city}` : ""}`}>
            <Badge variant={species === key ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${species === key ? "bg-amber-500" : ""}`}>
              {icon} {label}
            </Badge>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {posts.length} {posts.length === 1 ? "mascota" : "mascotas"} {statusLabels[activeStatus]?.toLowerCase()}
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <SearchX className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">No hay mascotas en este estado</p>
          {session && (
            <Link href="/lost-pets/new">
              <Button className="bg-amber-500 hover:bg-amber-600 mt-2">Reportar mascota perdida</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => {
            const photos = parseJsonArray(post.photos);
            return (
              <Link key={post.id} href={`/lost-pets/${post.id}`}>
                <Card className="cursor-pointer h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                    {photos[0] ? (
                      <img src={photos[0]} alt={post.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-5xl">{post.species === "DOG" ? "🐶" : post.species === "CAT" ? "🐱" : "🐾"}</span>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[post.status]}`}>
                        {statusLabels[post.status]}
                      </span>
                      {post.isUrgent && (
                        <Badge className="bg-red-500 text-white text-xs">
                          <AlertCircle className="h-3 w-3 mr-0.5" />
                          Urgente
                        </Badge>
                      )}
                    </div>
                    {post.reward && (
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-amber-500 text-white text-xs">
                          Recompensa ${post.reward.toLocaleString("es-CL")}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-3 space-y-1.5">
                    <h3 className="font-semibold">{post.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {speciesLabels[post.species]}{post.breed ? ` · ${post.breed}` : ""}{post.color ? ` · ${post.color}` : ""}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.city || post.lastSeenAddress || "Sin ubicación"}
                      </span>
                      <span>{timeAgo(post.lastSeenAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post._count.sightings} avistamiento{post._count.sightings !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

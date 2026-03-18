import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, Search, PlusCircle, PawPrint, AlertCircle, ClipboardList, BookMarked } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { StaggerContainer, StaggerItem, PressableCard, FloatingIcon } from "@/components/shared/motion";
import { differenceInMonths, differenceInYears } from "date-fns";

export default async function AdoptionPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; size?: string; city?: string; urgent?: string; q?: string }>;
}) {
  const session = await auth();
  const { species, size, city, urgent, q } = await searchParams;

  const cityRows = await prisma.adoptionPost.findMany({
    where: { status: "ACTIVE", city: { not: null } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const cities = cityRows.map((r) => r.city as string).filter(Boolean);

  const posts = await prisma.adoptionPost.findMany({
    where: {
      status: "ACTIVE",
      ...(urgent === "1" ? { isUrgent: true } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      pet: {
        ...(species ? { species } : {}),
        ...(size ? { size } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { breed: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    },
    include: {
      pet: {
        select: { id: true, name: true, species: true, breed: true, size: true, dateOfBirth: true, isVaccinated: true, isNeutered: true, photos: true },
      },
      poster: { select: { name: true, city: true } },
    },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  const speciesLabels: Record<string, string> = { DOG: "Perros", CAT: "Gatos" };
  const sizeLabels: Record<string, string> = { SMALL: "Pequeño", MEDIUM: "Mediano", LARGE: "Grande", XLARGE: "Extra grande" };

  function petAge(dob: Date | null) {
    if (!dob) return null;
    const years = differenceInYears(new Date(), dob);
    if (years > 0) return `${years} ${years === 1 ? "año" : "años"}`;
    const months = differenceInMonths(new Date(), dob);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  const hasFilters = !!(species || size || city || urgent || q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-500" />
            Adopción
          </h1>
          <p className="text-muted-foreground">Encuentra a tu compañero perfecto</p>
        </div>
        {session && (
          <Link href="/adoption/new">
            <Button className="bg-rose-500 hover:bg-rose-600">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Publicar en adopción
            </Button>
          </Link>
        )}
      </div>

      {/* Accesos rápidos para usuarios logueados */}
      {session && (
        <div className="flex gap-3">
          <Link href="/adoption/my-posts" className="flex-1">
            <div className="flex items-center gap-2 p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors cursor-pointer">
              <BookMarked className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Mis publicaciones</p>
                <p className="text-xs text-muted-foreground">Mascotas que publiqué</p>
              </div>
            </div>
          </Link>
          <Link href="/adoption/applications" className="flex-1">
            <div className="flex items-center gap-2 p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors cursor-pointer">
              <ClipboardList className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Mis solicitudes</p>
                <p className="text-xs text-muted-foreground">Adopciones que pedí</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Búsqueda */}
      <form className="flex flex-wrap gap-2 max-w-xl">
        <Input name="q" placeholder="Buscar por nombre o raza..." defaultValue={q || ""} className="flex-1 min-w-40" />
        {cities.length > 0 && (
          <select
            name="city"
            defaultValue={city || ""}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {species && <input type="hidden" name="species" value={species} />}
        {size && <input type="hidden" name="size" value={size} />}
        {urgent && <input type="hidden" name="urgent" value={urgent} />}
        <button type="submit" className="px-3 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Filtros especie */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/adoption${q ? `?q=${q}` : ""}`}>
          <Badge variant={!species ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${!species ? "bg-rose-500" : ""}`}>
            🐾 Todos
          </Badge>
        </Link>
        {Object.entries(speciesLabels).map(([key, label]) => (
          <Link key={key} href={`/adoption?species=${key}${q ? `&q=${q}` : ""}`}>
            <Badge variant={species === key ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${species === key ? "bg-rose-500" : ""}`}>
              {key === "DOG" ? "🐶" : "🐱"} {label}
            </Badge>
          </Link>
        ))}
        <Link href={`/adoption?urgent=1${species ? `&species=${species}` : ""}${q ? `&q=${q}` : ""}`}>
          <Badge variant={urgent === "1" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${urgent === "1" ? "bg-amber-500" : ""}`}>
            <AlertCircle className="h-3 w-3 mr-1" />
            Urgente
          </Badge>
        </Link>
      </div>

      {/* Filtros tamaño */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(sizeLabels).map(([key, label]) => (
          <Link key={key} href={`/adoption?size=${key}${species ? `&species=${species}` : ""}${q ? `&q=${q}` : ""}`}>
            <Badge variant={size === key ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 ${size === key ? "bg-rose-500" : ""}`}>
              {label}
            </Badge>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {posts.length} {posts.length === 1 ? "mascota disponible" : "mascotas disponibles"}
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <FloatingIcon>
            <PawPrint className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          </FloatingIcon>
          <p className="text-lg font-medium">No hay mascotas disponibles</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {q ? `No hay mascotas que coincidan con "${q}".` : "Pronto habrá mascotas en adopción."}
          </p>
          {hasFilters && (
            <Link href="/adoption">
              <Button variant="outline">Limpiar filtros</Button>
            </Link>
          )}
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => {
            const photos = parseJsonArray(post.pet.photos);
            const age = petAge(post.pet.dateOfBirth);
            return (
              <StaggerItem key={post.id}>
                <PressableCard>
                  <Link href={`/adoption/${post.id}`}>
                    <Card className="cursor-pointer h-full overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                        {photos[0] ? (
                          <img src={photos[0]} alt={post.pet.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-5xl">{post.pet.species === "DOG" ? "🐶" : "🐱"}</span>
                        )}
                        {post.isUrgent && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-white text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Urgente
                            </Badge>
                          </div>
                        )}
                        {post.isFosterOnly && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">Tránsito</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-3 space-y-1.5">
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {post.pet.species === "DOG" ? "🐶" : "🐱"} {speciesLabels[post.pet.species] ?? post.pet.species}
                          </Badge>
                          {post.pet.size && (
                            <Badge variant="outline" className="text-xs">{sizeLabels[post.pet.size]}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{post.pet.name}</h3>
                        {post.pet.breed && <p className="text-xs text-muted-foreground">{post.pet.breed}</p>}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-medium text-rose-600">
                            {post.adoptionFee > 0
                              ? `$${post.adoptionFee.toLocaleString("es-CL")}`
                              : "Sin costo"}
                          </span>
                          {age && <span className="text-xs text-muted-foreground">{age}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{post.poster.city || post.city}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </PressableCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}

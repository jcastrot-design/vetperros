import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyLostPets } from "@/lib/actions/lost-pets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, SearchX, AlertCircle, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours } from "date-fns";

const statusLabels: Record<string, string> = { LOST: "Perdido", FOUND: "Encontrado", REUNITED: "Reunido" };
const statusColors: Record<string, string> = {
  LOST: "bg-red-100 text-red-700 border-red-200",
  FOUND: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REUNITED: "bg-green-100 text-green-700 border-green-200",
};

function timeAgo(date: Date) {
  const hours = Math.max(0, differenceInHours(new Date(), date));
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.max(1, differenceInDays(new Date(), date));
  return `Hace ${days} día${days !== 1 ? "s" : ""}`;
}

export default async function MyLostPetsPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  const posts = await getMyLostPets();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/lost-pets">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <SearchX className="h-5 w-5 text-amber-500" />
              Mis reportes
            </h1>
            <p className="text-sm text-muted-foreground">{posts.length} reporte{posts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Link href="/lost-pets/new">
          <Button className="bg-amber-500 hover:bg-amber-600" size="sm">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Nuevo reporte
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <SearchX className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">No tienes reportes activos</p>
          <Link href="/lost-pets/new">
            <Button className="bg-amber-500 hover:bg-amber-600 mt-2">Reportar mascota perdida</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/lost-pets/${post.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">{post.species === "DOG" ? "🐶" : post.species === "CAT" ? "🐱" : "🐾"}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{post.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[post.status]}`}>
                        {statusLabels[post.status]}
                      </span>
                      {post.isUrgent && (
                        <Badge className="bg-red-500 text-white text-xs">
                          <AlertCircle className="h-3 w-3 mr-0.5" />Urgente
                        </Badge>
                      )}
                    </div>
                    {(post.city || post.lastSeenAddress) && (
                      <p className="text-xs text-muted-foreground">{post.city || post.lastSeenAddress}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post._count.sightings} avistamiento{post._count.sightings !== 1 ? "s" : ""}
                      </span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

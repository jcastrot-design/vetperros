import { getMyApplications } from "@/lib/actions/adoptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, PawPrint, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { applicationStatusLabels, applicationStatusColors } from "@/lib/validations/adoption";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WithdrawButton } from "@/components/adoption/withdraw-button";

export default async function MyAdoptionApplicationsPage() {
  const applications = await getMyApplications();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/adoption">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-500" />
            Mis solicitudes
          </h1>
          <p className="text-muted-foreground">Historial de mascotas que quieres adoptar</p>
        </div>
        <Link href="/adoption">
          <Button variant="outline">Explorar mascotas</Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <PawPrint className="h-14 w-14 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">Aún no has enviado solicitudes</p>
          <p className="text-muted-foreground">Explora las mascotas disponibles en adopción.</p>
          <Link href="/adoption">
            <Button className="bg-rose-500 hover:bg-rose-600 mt-2">Ver mascotas en adopción</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const photos = parseJsonArray(app.post.pet.photos);
            return (
              <Card key={app.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <Link href={`/adoption/${app.postId}`}>
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                        {photos[0] ? (
                          <img src={photos[0]} alt={app.post.pet.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-2xl">{app.post.pet.species === "DOG" ? "🐶" : "🐱"}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <Link href={`/adoption/${app.postId}`} className="font-semibold hover:text-rose-500 transition-colors">
                            {app.post.pet.name}
                          </Link>
                          {app.post.pet.breed && (
                            <p className="text-sm text-muted-foreground">{app.post.pet.breed}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Publicado por {app.post.poster.name}
                          </p>
                        </div>
                        <Badge variant={applicationStatusColors[app.status] as "default" | "secondary" | "destructive" | "outline"}>
                          {applicationStatusLabels[app.status]}
                        </Badge>
                      </div>

                      {app.message && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
                          &ldquo;{app.message}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(app.createdAt, "d MMM yyyy", { locale: es })}
                        </span>
                        <div className="flex gap-2">
                          {app.status === "APPROVED" && app.conversationId && (
                            <Link href={`/chat/${app.conversationId}`}>
                              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 h-7 text-xs">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Ir al chat
                              </Button>
                            </Link>
                          )}
                          {app.status === "PENDING" && (
                            <WithdrawButton applicationId={app.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

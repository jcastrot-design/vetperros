import { getPostApplications } from "@/lib/actions/adoptions";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, HeartHandshake, Home, PawPrint, Users, MessageCircle } from "lucide-react";
import Link from "next/link";
import { applicationStatusLabels, applicationStatusColors, housingLabels } from "@/lib/validations/adoption";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReviewApplicationButtons } from "@/components/adoption/review-application-buttons";
import { prisma } from "@/lib/prisma";

export default async function ManageAdoptionPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const session = await auth();
  if (!session) redirect("/signin");

  const post = await prisma.adoptionPost.findUnique({
    where: { id: postId },
    include: { pet: { select: { name: true, species: true, photos: true } } },
  });

  if (!post || post.posterId !== session.user.id) notFound();

  const applications = await getPostApplications(postId);

  const pendingCount = applications.filter((a) => a.status === "PENDING" || a.status === "REVIEWED").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/adoption/my-posts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-rose-500" />
            Solicitudes para {post.pet.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} solicitudes · {pendingCount} pendientes · {approvedCount} aprobadas
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="font-medium">Aún no hay solicitudes</p>
          <p className="text-sm text-muted-foreground">
            Cuando alguien quiera adoptar a {post.pet.name}, aparecerá aquí.
          </p>
          <Link href={`/adoption/${postId}`}>
            <Button variant="outline" size="sm">Ver publicación</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={app.applicant.avatarUrl || ""} />
                      <AvatarFallback>{app.applicant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{app.applicant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.applicant.city} · Solicitud {format(app.createdAt, "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={applicationStatusColors[app.status] as "default" | "secondary" | "destructive" | "outline"}>
                    {applicationStatusLabels[app.status]}
                  </Badge>
                </div>

                {app.message && (
                  <blockquote className="border-l-2 border-rose-300 pl-3 text-sm text-muted-foreground italic">
                    {app.message}
                  </blockquote>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {app.housingSituation && (
                    <div className="flex items-center gap-1.5">
                      <Home className="h-3 w-3 text-muted-foreground" />
                      <span>{housingLabels[app.housingSituation]}</span>
                    </div>
                  )}
                  {app.hasYard !== null && (
                    <div className="flex items-center gap-1.5">
                      <PawPrint className="h-3 w-3 text-muted-foreground" />
                      <span>{app.hasYard ? "Tiene patio" : "Sin patio"}</span>
                    </div>
                  )}
                  {app.hasOtherPets !== null && (
                    <p className="col-span-2 text-muted-foreground">
                      {app.hasOtherPets ? `Tiene otras mascotas: ${app.otherPetsInfo || "sí"}` : "No tiene otras mascotas"}
                    </p>
                  )}
                  {app.hasChildren !== null && (
                    <p className="col-span-2 text-muted-foreground">
                      {app.hasChildren ? `Niños en el hogar: ${app.childrenAges || "sí"}` : "Sin niños en el hogar"}
                    </p>
                  )}
                  {app.workSchedule && (
                    <p className="col-span-2 text-muted-foreground">Horario: {app.workSchedule}</p>
                  )}
                  {app.experience && (
                    <p className="col-span-2 text-muted-foreground">Experiencia: {app.experience}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1 flex-wrap">
                  {app.status === "APPROVED" && app.conversationId && (
                    <Link href={`/chat/${app.conversationId}`}>
                      <Button size="sm" className="bg-rose-500 hover:bg-rose-600 h-8 text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Ir al chat
                      </Button>
                    </Link>
                  )}
                  {(app.status === "PENDING" || app.status === "REVIEWED") && (
                    <ReviewApplicationButtons applicationId={app.id} applicantName={app.applicant.name} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, FileText, Award, ExternalLink } from "lucide-react";
import {
  providerTypeLabels, docTypeLabels, docStatusLabels,
  badgeTypeLabels, verificationStatusLabels,
} from "@/lib/validations/provider";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProviderAdminActions } from "@/components/admin/provider-admin-actions";

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, email: true, avatarUrl: true, createdAt: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
      badges: { orderBy: { earnedAt: "desc" } },
    },
  });

  if (!profile) notFound();

  const initials = profile.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.user.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">{profile.displayName}</h1>
                <p className="text-muted-foreground">
                  {profile.user.email} · {providerTypeLabels[profile.type]}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Registro: {format(new Date(profile.user.createdAt), "dd MMM yyyy", { locale: es })}
                  {" · "}Trust: {profile.trustScore}%
                  {" · "}{profile.totalServices} servicios
                  {" · "}Rating: {profile.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
            <Badge className={`${
              profile.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" :
              profile.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              profile.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              <Shield className="h-3 w-3 mr-1" />
              {verificationStatusLabels[profile.verificationStatus]}
            </Badge>
          </div>

          {profile.bio && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          {/* Admin Actions */}
          <div className="mt-4 pt-4 border-t">
            <ProviderAdminActions
              profileId={profile.id}
              verificationStatus={profile.verificationStatus}
              badges={profile.badges.map((b) => ({ id: b.id, type: b.type }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos ({profile.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No ha subido documentos
            </p>
          ) : (
            <div className="space-y-3">
              {profile.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{docTypeLabels[doc.type]}</p>
                      <Badge className={`text-xs ${statusColors[doc.status] || ""}`}>
                        {docStatusLabels[doc.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subido: {format(new Date(doc.uploadedAt), "dd MMM yyyy", { locale: es })}
                      {doc.reviewedAt && ` · Revisado: ${format(new Date(doc.reviewedAt), "dd MMM yyyy", { locale: es })}`}
                    </p>
                    {doc.notes && <p className="text-xs text-muted-foreground">Nota: {doc.notes}</p>}
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges ({profile.badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.badges.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Sin badges asignados
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <Badge key={badge.id} variant="secondary" className="text-sm py-1 px-3">
                  <Award className="h-3.5 w-3.5 mr-1.5" />
                  {badgeTypeLabels[badge.type] || badge.type}
                  <span className="text-xs text-muted-foreground ml-2">
                    {format(new Date(badge.earnedAt), "dd/MM/yy", { locale: es })}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

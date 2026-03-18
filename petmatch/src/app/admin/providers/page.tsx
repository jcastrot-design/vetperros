import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Clock, Star } from "lucide-react";
import { providerTypeLabels, verificationStatusLabels } from "@/lib/validations/provider";
import Link from "next/link";

const statusColors: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function AdminProvidersPage() {
  const providers = await prisma.providerProfile.findMany({
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } },
      badges: true,
      _count: { select: { documents: true } },
    },
    orderBy: [
      { verificationStatus: "asc" }, // PENDING first
      { createdAt: "desc" },
    ],
  });

  const pendingCount = providers.filter((p) => p.verificationStatus === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verificacion de Proveedores</h1>
        <p className="text-muted-foreground">
          {providers.length} proveedores · {pendingCount} pendientes de verificacion
        </p>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay proveedores registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => {
            const initials = provider.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link key={provider.id} href={`/admin/providers/${provider.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={provider.user.avatarUrl || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{provider.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.user.email} · {providerTypeLabels[provider.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[provider.verificationStatus]}>
                        {verificationStatusLabels[provider.verificationStatus]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                        {provider.averageRating.toFixed(1)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {provider._count.documents} docs · {provider.badges.length} badges
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

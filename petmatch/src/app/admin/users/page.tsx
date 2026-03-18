import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const roleLabels: Record<string, string> = {
  OWNER: "Dueno",
  WALKER: "Paseador",
  CLINIC: "Clinica",
  ADMIN: "Admin",
};

const roleColors: Record<string, string> = {
  OWNER: "bg-blue-100 text-blue-700",
  WALKER: "bg-green-100 text-green-700",
  CLINIC: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { pets: true, bookingsAsClient: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion de Usuarios</h1>
        <p className="text-muted-foreground">{users.length} usuarios registrados</p>
      </div>

      <div className="space-y-2">
        {users.map((user) => {
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Link key={user.id} href={`/admin/users/${user.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">Baneado</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {user._count.pets} mascotas, {user._count.bookingsAsClient} reservas
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

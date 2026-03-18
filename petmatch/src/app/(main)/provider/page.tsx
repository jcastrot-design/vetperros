import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase, CalendarDays, Star, PlusCircle, DollarSign,
  AlertCircle, Clock,
} from "lucide-react";
import { bookingStatusLabels } from "@/lib/validations/service";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ProviderDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [serviceCount, bookingCount, completedCount, reviews, earnings, profile, upcomingBookings] =
    await Promise.all([
      prisma.service.count({ where: { providerId: userId } }),
      prisma.booking.count({ where: { providerId: userId } }),
      prisma.booking.count({ where: { providerId: userId, status: "COMPLETED" } }),
      prisma.review.findMany({
        where: { targetId: userId },
        select: { rating: true },
      }),
      prisma.booking.aggregate({
        where: { providerId: userId, status: "COMPLETED" },
        _sum: { providerEarnings: true },
      }),
      prisma.providerProfile.findUnique({ where: { userId } }),
      prisma.booking.findMany({
        where: {
          providerId: userId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
        include: {
          service: { select: { title: true } },
          client: { select: { name: true } },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
    ]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "N/A";

  const totalEarnings = earnings._sum.providerEarnings || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Proveedor</h1>
          <p className="text-muted-foreground">Gestiona tus servicios y reservas</p>
        </div>
        <Link href="/provider/services/new">
          <Button className="bg-brand hover:bg-brand-hover">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </Link>
      </div>

      {/* Onboarding alert */}
      {!profile && (
        <Link href="/provider/onboarding">
          <Card className="border-orange-200 bg-orange-50/50 hover:shadow-md transition-shadow">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500 shrink-0" />
              <div>
                <p className="font-medium">Completa tu perfil de proveedor</p>
                <p className="text-sm text-muted-foreground">
                  Configura tu perfil para aparecer en busquedas y recibir reservas
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">{bookingCount} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calificacion</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">{reviews.length} resenas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Proximas reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((b) => (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{b.service?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.client?.name} -{" "}
                      {new Date(b.startDate).toLocaleDateString("es-CL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge className={statusColors[b.status]}>
                    {bookingStatusLabels[b.status]}
                  </Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

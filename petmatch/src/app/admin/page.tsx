import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, CalendarDays, Heart, PawPrint, DollarSign, Flag,
  AlertTriangle, Shield, Star, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export default async function AdminDashboard() {
  const [
    userCount,
    petCount,
    bookingCount,
    matchCount,
    reportCount,
    revenue,
    providerCount,
    pendingProviders,
    incidentCount,
    openIncidents,
    completedBookings,
    avgRating,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.pet.count(),
    prisma.booking.count(),
    prisma.swipe.count({ where: { action: "LIKE" } }),
    prisma.report.count({ where: { isResolved: false } }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.providerProfile.count(),
    prisma.providerProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.incident.count(),
    prisma.incident.count({ where: { status: "OPEN" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  // Chart data: bookings by status
  const bookingStatusCounts = await prisma.booking.groupBy({
    by: ["status"],
    _count: true,
  });
  const bookingsByStatus = bookingStatusCounts.map((b) => ({
    name: statusLabels[b.status] || b.status,
    value: b._count,
  }));

  // Chart data: revenue by month (from payments)
  const payments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED" },
    select: { amount: true, createdAt: true },
  });
  const revenueMap = new Map<string, number>();
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  payments.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    revenueMap.set(key, (revenueMap.get(key) || 0) + p.amount);
  });
  const revenueByMonth = Array.from(revenueMap.entries())
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      provider: { select: { name: true } },
      service: { select: { title: true, type: true } },
    },
  });

  const metrics = [
    { title: "Usuarios", value: userCount, icon: Users, color: "text-blue-500" },
    { title: "Mascotas", value: petCount, icon: PawPrint, color: "text-orange-500" },
    { title: "Reservas", value: bookingCount, icon: CalendarDays, color: "text-green-500" },
    { title: "Completadas", value: completedBookings, icon: TrendingUp, color: "text-emerald-500" },
    {
      title: "Ingresos",
      value: `$${(revenue._sum.amount || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      title: "Rating Promedio",
      value: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : "N/A",
      icon: Star,
      color: "text-yellow-500",
    },
    { title: "Proveedores", value: providerCount, icon: Shield, color: "text-purple-500" },
    { title: "Likes", value: matchCount, icon: Heart, color: "text-pink-500" },
    {
      title: "Reportes Pendientes",
      value: reportCount,
      icon: Flag,
      color: reportCount > 0 ? "text-red-500" : "text-gray-400",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administracion</h1>

      {/* Metrics grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {pendingProviders > 0 && (
          <Link href="/admin/providers">
            <Card className="border-orange-200 bg-orange-50/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-4 flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium">{pendingProviders} proveedores pendientes</p>
                  <p className="text-sm text-muted-foreground">Requieren verificacion</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        {openIncidents > 0 && (
          <Link href="/admin/incidents">
            <Card className="border-red-200 bg-red-50/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium">{openIncidents} incidentes abiertos</p>
                  <p className="text-sm text-muted-foreground">Requieren atencion</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Charts */}
      <DashboardCharts
        bookingsByStatus={bookingsByStatus}
        revenueByMonth={revenueByMonth}
      />

      {/* Recent bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reservas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay reservas aun</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{b.service?.title || "Servicio"}</p>
                    <p className="text-muted-foreground">
                      {b.client?.name} → {b.provider?.name}
                    </p>
                  </div>
                  <Badge className={statusColors[b.status] || ""}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

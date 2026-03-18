import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { bookingStatusLabels, serviceTypeLabels } from "@/lib/validations/service";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const where = status ? { status } : {};

  const [bookings, total, pending, confirmed, inProgress, completed, cancelled] =
    await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: { select: { title: true, type: true } },
          client: { select: { name: true } },
          provider: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "IN_PROGRESS" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
    ]);

  const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statuses = [
    { label: "Todos", value: "", count: total },
    { label: "Pendientes", value: "PENDING", count: pending },
    { label: "Confirmadas", value: "CONFIRMED", count: confirmed },
    { label: "En curso", value: "IN_PROGRESS", count: inProgress },
    { label: "Completadas", value: "COMPLETED", count: completed },
    { label: "Canceladas", value: "CANCELLED", count: cancelled },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reservas</h1>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En curso</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/bookings?status=${s.value}` : "/admin/bookings"}
          >
            <Badge
              variant={status === s.value || (!status && !s.value) ? "default" : "outline"}
              className="cursor-pointer"
            >
              {s.label} ({s.count})
            </Badge>
          </Link>
        ))}
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No hay reservas con este filtro</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{b.service?.title || "Servicio eliminado"}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.client?.name} → {b.provider?.name}
                    {b.service && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {serviceTypeLabels[b.service.type]}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.startDate).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={statusColors[b.status]}>
                    {bookingStatusLabels[b.status]}
                  </Badge>
                  <p className="text-sm font-semibold">${b.totalPrice.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

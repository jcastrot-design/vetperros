import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ProviderEarningsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const completedBookings = await prisma.booking.findMany({
    where: { providerId: userId, status: "COMPLETED" },
    include: {
      service: { select: { title: true, type: true } },
      client: { select: { name: true } },
    },
    orderBy: { endDate: "desc" },
  });

  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.providerEarnings || 0),
    0,
  );
  const totalPlatformFees = completedBookings.reduce(
    (sum, b) => sum + (b.platformFee || 0),
    0,
  );

  // Monthly breakdown
  const monthlyMap = new Map<string, { earnings: number; count: number }>();
  for (const b of completedBookings) {
    const key = format(new Date(b.endDate), "yyyy-MM");
    const current = monthlyMap.get(key) || { earnings: 0, count: 0 };
    current.earnings += b.providerEarnings || 0;
    current.count += 1;
    monthlyMap.set(key, current);
  }

  const monthlyData = Array.from(monthlyMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, data]) => ({
      month: format(new Date(key + "-01"), "MMMM yyyy", { locale: es }),
      ...data,
    }));

  // Current month stats
  const now = new Date();
  const currentMonthKey = format(now, "yyyy-MM");
  const currentMonth = monthlyMap.get(currentMonthKey) || {
    earnings: 0,
    count: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Ingresos</h1>
        <p className="text-muted-foreground">
          Resumen financiero de tus servicios completados
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedBookings.length} servicios completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentMonth.earnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonth.count} servicios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comision Plataforma
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              ${totalPlatformFees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">15% por servicio</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly breakdown */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((m) => (
                <div
                  key={m.month}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium capitalize">{m.month}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.count} {m.count === 1 ? "servicio" : "servicios"}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-600">
                    ${m.earnings.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {completedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aun no tienes servicios completados
            </p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{b.service?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.client?.name} -{" "}
                      {format(new Date(b.endDate), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      +${(b.providerEarnings || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: ${(b.totalPrice || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

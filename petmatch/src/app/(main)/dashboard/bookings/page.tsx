import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookingStatusLabels, serviceTypeLabels } from "@/lib/validations/service";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BookingsPage() {
  const session = await auth();

  const bookings = await prisma.booking.findMany({
    where: { clientId: session!.user.id },
    include: {
      service: { include: { provider: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Reservas</h1>
        <p className="text-muted-foreground">Historial de todas tus reservas</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            No tienes reservas aun
          </p>
          <Link
            href="/services"
            className="text-orange-500 hover:underline text-sm"
          >
            Buscar servicios
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
            >
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{booking.service.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceTypeLabels[booking.service.type]} con{" "}
                      {booking.service.provider.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.startDate).toLocaleDateString("es-CL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={statusColors[booking.status]}>
                      {bookingStatusLabels[booking.status]}
                    </Badge>
                    <p className="text-sm font-semibold">
                      ${booking.totalPrice.toLocaleString()}
                    </p>
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

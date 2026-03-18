import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, CalendarDays, Clock, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TeleconsultaCall } from "./teleconsulta-call";
import { joinTeleconsultaRoom } from "@/lib/actions/teleconsulta";

export default async function TeleconsultaRoomPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session) redirect("/signin");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { type: true, title: true } },
      provider: { select: { name: true, avatarUrl: true } },
      client: { select: { name: true, avatarUrl: true } },
      pet: { select: { name: true } },
    },
  });

  if (!booking) notFound();
  if (booking.service.type !== "TELECONSULTA") notFound();

  const isProvider = booking.providerId === session.user.id;
  const isClient = booking.clientId === session.user.id;
  if (!isProvider && !isClient) notFound();

  const canJoin = ["CONFIRMED", "IN_PROGRESS"].includes(booking.status);

  // Pre-fetch room access if booking is ready
  let roomUrl: string | null = null;
  let joinToken: string | null = null;
  let joinError: string | null = null;

  if (canJoin) {
    const result = await joinTeleconsultaRoom(bookingId);
    if (result.error) {
      joinError = result.error;
    } else {
      roomUrl = result.roomUrl!;
      joinToken = result.token!;
    }
  }

  const otherParty = isProvider ? booking.client : booking.provider;
  const role = isProvider ? "Veterinario" : "Dueño de mascota";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            Teleconsulta
          </h1>
          <p className="text-sm text-muted-foreground">{booking.service.title}</p>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Fecha</p>
            <p className="font-medium">{format(booking.startDate, "d MMM yyyy", { locale: es })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Hora</p>
            <p className="font-medium">
              {format(booking.startDate, "HH:mm")} – {format(booking.endDate, "HH:mm")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" />{isProvider ? "Paciente" : "Veterinario"}</p>
            <p className="font-medium">{otherParty.name}</p>
          </div>
          {booking.pet && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Mascota</p>
              <p className="font-medium">{booking.pet.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      {booking.status === "PENDING" && (
        <Card className="border-yellow-200">
          <CardContent className="pt-4 text-center space-y-2">
            <Badge className="bg-yellow-100 text-yellow-700">Pendiente de confirmación</Badge>
            <p className="text-sm text-muted-foreground">
              {isProvider
                ? "Confirma la reserva para habilitar la sala de videollamada."
                : "Esperando que el veterinario confirme la consulta."}
            </p>
          </CardContent>
        </Card>
      )}

      {booking.status === "CANCELLED" && (
        <Card className="border-red-200">
          <CardContent className="pt-4 text-center">
            <Badge className="bg-red-100 text-red-700">Consulta cancelada</Badge>
          </CardContent>
        </Card>
      )}

      {joinError && (
        <Card className="border-orange-200">
          <CardContent className="pt-4 text-center space-y-2">
            <p className="text-orange-700 font-medium">No se pudo conectar a la sala</p>
            <p className="text-sm text-muted-foreground">{joinError}</p>
          </CardContent>
        </Card>
      )}

      {/* Video call */}
      {canJoin && roomUrl && joinToken && (
        <TeleconsultaCall
          roomUrl={roomUrl}
          token={joinToken}
          userName={(isProvider ? booking.provider.name : booking.client.name) ?? "Participante"}
        />
      )}
    </div>
  );
}

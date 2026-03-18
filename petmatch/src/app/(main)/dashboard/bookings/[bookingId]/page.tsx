import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Clock, DollarSign, MessageCircle, CheckCircle2, MapPin, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingStatusLabels, serviceTypeLabels } from "@/lib/validations/service";
import { BookingActions } from "@/components/services/booking-actions";
import { PayBookingButton } from "@/components/services/pay-booking-button";
import { ServicePhotos } from "@/components/services/service-photos";
import { ReportCardView } from "@/components/tracking/report-card-view";
import { ReportCardForm } from "@/components/tracking/report-card-form";
import { LiveTrackingMap } from "@/components/tracking/live-tracking-map";
import { ReviewForm } from "@/components/services/review-form";
import { IncidentReportButton } from "@/components/services/incident-report-button";
import { CheckinButton } from "@/components/services/checkin-button";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { bookingId } = await params;
  const { payment } = await searchParams;
  const session = await auth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      provider: true,
      client: true,
      review: true,
      pet: { select: { name: true, species: true, breed: true } },
      reportCard: {
        include: {
          booking: { include: { provider: { select: { name: true, avatarUrl: true } } } },
        },
      },
    },
  });

  if (!booking) notFound();

  const isClient = booking.clientId === session!.user.id;
  const isProvider = booking.providerId === session!.user.id;

  if (!isClient && !isProvider && session!.user.role !== "ADMIN") {
    notFound();
  }

  const counterpart = isClient ? booking.provider : booking.client;
  const initials = counterpart.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Find conversation between client and provider for chat link
  const conversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: { id: { in: [booking.clientId, booking.providerId] } },
      },
    },
    select: { id: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {payment === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Pago realizado con exito</p>
            <p className="text-sm text-green-700">Tu reserva ha sido confirmada. El proveedor ha sido notificado.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle de Reserva</h1>
        <Badge className={statusColors[booking.status]}>
          {bookingStatusLabels[booking.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{booking.service.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {serviceTypeLabels[booking.service.type]}
            </Badge>
            {booking.pet && (
              <Badge variant="outline">
                {booking.pet.name} ({booking.pet.breed || booking.pet.species})
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Inicio</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.startDate).toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fin</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.endDate).toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-lg">
              ${booking.totalPrice.toLocaleString()} CLP
            </span>
          </div>

          {booking.notes && (
            <div>
              <p className="text-sm font-medium mb-1">Notas</p>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider/Client info */}
      <Card>
        <CardHeader>
          <CardTitle>{isClient ? "Proveedor" : "Cliente"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={counterpart.avatarUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{counterpart.name}</p>
                <p className="text-sm text-muted-foreground">{counterpart.email}</p>
              </div>
            </div>
            {conversation && (
              <Link href={`/chat/${conversation.id}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  Chat
                </Badge>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teleconsulta join button */}
      {booking.service.type === "TELECONSULTA" && ["CONFIRMED", "IN_PROGRESS"].includes(booking.status) && (
        <Link href={`/teleconsulta/${booking.id}`}>
          <Card className="border-blue-200 bg-blue-50/40 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Video className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Sala de videollamada lista</p>
                  <p className="text-xs text-blue-700">Haz clic para unirte a la teleconsulta</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Video className="h-4 w-4" />
                Unirse
              </Button>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Live GPS Tracking (for WALK services) */}
      {booking.service.type === "WALK" && (
        <LiveTrackingMap
          bookingId={booking.id}
          isProvider={isProvider}
          bookingStatus={booking.status}
        />
      )}

      {/* Service photos */}
      {(booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") && (
        <ServicePhotos
          bookingId={booking.id}
          isProvider={isProvider}
          bookingStatus={booking.status}
        />
      )}

      {/* Report Card form (provider can create during IN_PROGRESS) */}
      {booking.status === "IN_PROGRESS" && isProvider && !booking.reportCard && (
        <ReportCardForm bookingId={booking.id} />
      )}

      {/* Report Card view (if exists) */}
      {booking.reportCard && (
        <ReportCardView reportCard={booking.reportCard} />
      )}

      {/* Check-in/Check-out evidence */}
      {booking.checkinAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-600">
              <MapPin className="h-5 w-5" />
              Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {new Date(booking.checkinAt).toLocaleString("es-CL")}
            </p>
            {booking.checkinLat && booking.checkinLng && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {booking.checkinLat.toFixed(6)}, {booking.checkinLng.toFixed(6)}
              </p>
            )}
            {booking.checkinPhoto && (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                <img
                  src={booking.checkinPhoto}
                  alt="Check-in"
                  className="rounded-lg max-h-40 object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {booking.checkoutAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <MapPin className="h-5 w-5" />
              Check-out
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {new Date(booking.checkoutAt).toLocaleString("es-CL")}
            </p>
            {booking.checkoutLat && booking.checkoutLng && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {booking.checkoutLat.toFixed(6)}, {booking.checkoutLng.toFixed(6)}
              </p>
            )}
            {booking.checkoutPhoto && (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                <img
                  src={booking.checkoutPhoto}
                  alt="Check-out"
                  className="rounded-lg max-h-40 object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Check-in/Check-out buttons for provider */}
      {isProvider && booking.status === "CONFIRMED" && (
        <CheckinButton bookingId={booking.id} type="checkin" />
      )}
      {isProvider && booking.status === "IN_PROGRESS" && (
        <CheckinButton bookingId={booking.id} type="checkout" />
      )}

      {/* Pay button — shown when provider confirmed and client hasn't paid */}
      {booking.status === "CONFIRMED" && isClient && (
        <PayBookingButton bookingId={booking.id} totalPrice={booking.totalPrice} />
      )}

      {/* Actions */}
      <BookingActions
        bookingId={booking.id}
        status={booking.status}
        isClient={isClient}
        isProvider={isProvider}
        hasReview={!!booking.review}
      />

      {/* Incident report button */}
      {(booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") && (
        <IncidentReportButton bookingId={booking.id} />
      )}

      {/* Review form (client only, completed, no review yet) */}
      {booking.status === "COMPLETED" && isClient && !booking.review && (
        <ReviewForm bookingId={booking.id} providerName={booking.provider?.name || "Proveedor"} />
      )}

      {/* Show existing review */}
      {booking.review && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tu resena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < booking.review!.rating ? "text-yellow-500" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            {booking.review.comment && (
              <p className="text-sm">{booking.review.comment}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

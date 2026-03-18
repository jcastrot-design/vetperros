import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PawPrint, CalendarDays, Heart, Search, Bell, Clock, Star, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { reminderTypeLabels } from "@/lib/validations/pet";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [petCount, bookingCount, matchCount, pets, recentBookings, activeBookings, pendingReviews] = await Promise.all([
    prisma.pet.count({ where: { ownerId: userId } }),
    prisma.booking.count({ where: { clientId: userId } }),
    prisma.swipe.count({ where: { senderId: userId, action: "LIKE" } }),
    prisma.pet.findMany({
      where: { ownerId: userId },
      include: {
        reminders: {
          where: { status: { in: ["PENDING", "SENT"] } },
          orderBy: { dueDate: "asc" },
          take: 3,
        },
      },
      take: 4,
    }),
    prisma.booking.findMany({
      where: { clientId: userId },
      include: { service: { include: { provider: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.booking.findMany({
      where: { clientId: userId, status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      include: { service: { include: { provider: true } } },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
    prisma.booking.findMany({
      where: {
        clientId: userId,
        status: "COMPLETED",
        review: null,
      },
      include: { service: { include: { provider: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  const allReminders = pets.flatMap((pet) =>
    pet.reminders.map((r) => ({ ...r, petName: pet.name })),
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {session!.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de PetMatch
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mis Mascotas</CardTitle>
            <PawPrint className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchCount}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <Link href="/services">
              <Button className="w-full bg-brand hover:bg-brand-hover">
                <Search className="mr-2 h-4 w-4" />
                Buscar Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Active booking - IN_PROGRESS highlighted */}
      {activeBookings.some((b) => b.status === "IN_PROGRESS") && (
        <div>
          {activeBookings.filter((b) => b.status === "IN_PROGRESS").map((booking) => (
            <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
              <Card className="border-purple-300 bg-purple-50/50 hover:shadow-md transition-shadow">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-700 animate-pulse">
                      Servicio en curso
                    </Badge>
                    <span className="text-sm font-medium text-purple-700">
                      Desde {format(new Date(booking.startDate), "HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="font-semibold text-lg">{booking.service.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      con {booking.service.provider.name}
                    </p>
                    <div className="flex gap-2">
                      {booking.service.type === "WALK" && (
                        <Badge variant="outline" className="text-xs">Ver tracking</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">Chat</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Confirmed bookings */}
      {activeBookings.filter((b) => b.status === "CONFIRMED").length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            Proximas Reservas
          </h2>
          <div className="space-y-2">
            {activeBookings.filter((b) => b.status === "CONFIRMED").map((booking) => (
              <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                <Card className="hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.service.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service.provider.name} · {format(new Date(booking.startDate), "dd MMM HH:mm", { locale: es })}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Confirmada</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Review prompts */}
      {pendingReviews.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Deja tu resena
          </h2>
          <div className="space-y-2">
            {pendingReviews.map((booking) => (
              <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                <Card className="border-yellow-200 bg-yellow-50/50 hover:shadow-md transition-shadow">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.service.title}</p>
                      <p className="text-sm text-muted-foreground">
                        con {booking.service.provider.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="h-4 w-4" />
                        ))}
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">Resenar</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming reminders */}
      {allReminders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Proximos Recordatorios
            </h2>
            <Link href="/dashboard/reminders">
              <Button variant="outline" size="sm">Ver todos</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {allReminders.map((r) => {
              const isOverdue = new Date(r.dueDate) < new Date();
              return (
                <Card key={r.id} className={isOverdue ? "border-red-200" : ""}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{r.title}</span>
                      <Badge variant="secondary" className="text-xs">{r.petName}</Badge>
                      {isOverdue && <Badge variant="destructive" className="text-xs">Vencido</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(r.dueDate), { locale: es, addSuffix: true })}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* My pets */}
      {pets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-500" />
              Mis Mascotas
            </h2>
            <Link href="/dashboard/pets">
              <Button variant="outline" size="sm">Ver todas</Button>
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {pets.map((pet) => {
              const petPhotos: string[] = (() => { try { return JSON.parse(pet.photos); } catch { return []; } })();
              const firstPhoto = petPhotos[0];
              return (
                <Link key={pet.id} href={`/dashboard/pets/${pet.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 text-center">
                      {firstPhoto ? (
                        <img src={firstPhoto} alt={pet.name} className="h-12 w-12 mx-auto rounded-full object-cover mb-2" />
                      ) : (
                        <div className="h-12 w-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2">
                          <PawPrint className="h-6 w-6 text-orange-400" />
                        </div>
                      )}
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.breed || pet.species}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/pets/new">
          <Card className="hover:border-orange-300 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
              <PawPrint className="h-10 w-10 text-orange-400" />
              <h3 className="font-semibold">Agregar Mascota</h3>
              <p className="text-sm text-muted-foreground">Registra una nueva mascota</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/match">
          <Card className="hover:border-pink-300 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
              <Heart className="h-10 w-10 text-pink-400" />
              <h3 className="font-semibold">PetMatch</h3>
              <p className="text-sm text-muted-foreground">Encuentra amigos para tu mascota</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/favorites">
          <Card className="hover:border-yellow-300 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
              <Star className="h-10 w-10 text-yellow-400" />
              <h3 className="font-semibold">Favoritos</h3>
              <p className="text-sm text-muted-foreground">Tus proveedores y servicios guardados</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Historial de Reservas</h2>
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.service.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service.provider.name} · {format(new Date(booking.startDate), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge className={
                      booking.status === "COMPLETED" ? "bg-green-100 text-green-700"
                        : booking.status === "CANCELLED" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }>
                      {booking.status === "PENDING" && "Pendiente"}
                      {booking.status === "CONFIRMED" && "Confirmada"}
                      {booking.status === "IN_PROGRESS" && "En curso"}
                      {booking.status === "COMPLETED" && "Completada"}
                      {booking.status === "CANCELLED" && "Cancelada"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

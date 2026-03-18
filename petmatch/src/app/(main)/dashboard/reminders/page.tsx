import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { reminderTypeLabels } from "@/lib/validations/pet";
import { EmptyState } from "@/components/shared/empty-state";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const reminderTypeColors: Record<string, string> = {
  VACCINE: "bg-purple-100 text-purple-700",
  DEWORMING: "bg-orange-100 text-orange-700",
  MEDICATION: "bg-blue-100 text-blue-700",
  GROOMING: "bg-pink-100 text-pink-700",
  CHECKUP: "bg-green-100 text-green-700",
  CUSTOM: "bg-gray-100 text-gray-700",
};

export default async function RemindersPage() {
  const session = await auth();

  const pets = await prisma.pet.findMany({
    where: { ownerId: session!.user.id },
    include: {
      reminders: {
        where: { status: { in: ["PENDING", "SENT"] } },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  const allReminders = pets.flatMap((pet) =>
    pet.reminders.map((r) => ({ ...r, petName: pet.name })),
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdue = allReminders.filter((r) => new Date(r.dueDate) < new Date());
  const upcoming = allReminders.filter((r) => new Date(r.dueDate) >= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recordatorios</h1>
        <p className="text-muted-foreground">
          {allReminders.length} recordatorios pendientes
        </p>
      </div>

      {overdue.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Vencidos ({overdue.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdue.map((r) => (
              <ReminderItem key={r.id} reminder={r} isOverdue />
            ))}
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proximos ({upcoming.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((r) => (
              <ReminderItem key={r.id} reminder={r} />
            ))}
          </CardContent>
        </Card>
      )}

      {allReminders.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No hay recordatorios pendientes"
          description="Configura recordatorios de vacunas, desparasitaciones y chequeos desde el perfil de tu mascota."
          actions={[
            { label: "Ir a mis mascotas", href: "/dashboard/pets" },
          ]}
        />
      )}
    </div>
  );
}

function ReminderItem({
  reminder,
  isOverdue,
}: {
  reminder: { id: string; title: string; type: string; dueDate: Date; petName: string; description: string | null };
  isOverdue?: boolean;
}) {
  return (
    <div className={`p-3 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium">{reminder.title}</span>
        <Badge className={`text-xs ${reminderTypeColors[reminder.type] || ""}`}>
          {reminderTypeLabels[reminder.type] || reminder.type}
        </Badge>
        <Badge variant="secondary" className="text-xs">{reminder.petName}</Badge>
        {isOverdue && <Badge variant="destructive" className="text-xs">Vencido</Badge>}
      </div>
      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(reminder.dueDate), "dd MMM yyyy", { locale: es })}
        </span>
        <span>
          ({formatDistanceToNow(new Date(reminder.dueDate), { locale: es, addSuffix: true })})
        </span>
      </div>
      {reminder.description && (
        <p className="text-xs text-muted-foreground mt-1">{reminder.description}</p>
      )}
    </div>
  );
}

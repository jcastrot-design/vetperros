import { getIncidents } from "@/lib/actions/incidents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { IncidentActions } from "@/components/admin/incident-actions";

const severityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const categoryLabels: Record<string, string> = {
  PAYMENT: "Pago",
  SERVICE: "Servicio",
  PROVIDER: "Proveedor",
  EMERGENCY: "Emergencia",
};

export default async function AdminIncidentsPage() {
  const incidents = await getIncidents();

  const openCount = incidents.filter((i) => i.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incidentes</h1>
          <p className="text-muted-foreground">
            {openCount} abiertos de {incidents.length} total
          </p>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay incidentes reportados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {categoryLabels[incident.category] || incident.category}
                      {" - "}
                      {incident.booking?.service?.title || "Sin servicio"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Reportado por {incident.reporter?.name || "Desconocido"}
                      {" - "}
                      {formatDistanceToNow(new Date(incident.createdAt), { locale: es, addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={severityColors[incident.severity] || ""}>
                      {incident.severity}
                    </Badge>
                    <Badge className={statusColors[incident.status] || ""}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{incident.description}</p>

                {incident.booking && (
                  <div className="text-sm text-muted-foreground">
                    <span>Reserva: </span>
                    <Link
                      href={`/admin/bookings`}
                      className="text-orange-600 hover:underline"
                    >
                      {incident.booking.service?.title} - {incident.booking.client?.name}
                    </Link>
                  </div>
                )}

                {incident.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm font-medium text-green-800">Resolucion:</p>
                    <p className="text-sm text-green-700">{incident.resolution}</p>
                  </div>
                )}

                {incident.status === "OPEN" && (
                  <IncidentActions incidentId={incident.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

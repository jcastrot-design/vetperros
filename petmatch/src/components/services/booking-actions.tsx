"use client";

import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  isClient: boolean;
  isProvider: boolean;
  hasReview: boolean;
}

export function BookingActions({
  bookingId,
  status,
  isClient,
  isProvider,
  hasReview,
}: BookingActionsProps) {
  const router = useRouter();

  const statusMessages: Record<string, { title: string; desc: string }> = {
    CONFIRMED: { title: "Reserva confirmada", desc: "El cliente sera notificado" },
    IN_PROGRESS: { title: "Servicio iniciado", desc: "Recuerda crear el report card al finalizar" },
    COMPLETED: { title: "Servicio completado", desc: "El pago sera procesado automaticamente" },
    CANCELLED: { title: "Reserva cancelada", desc: "Se notifico al usuario" },
  };

  async function handleAction(newStatus: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      const msg = statusMessages[newStatus];
      toast.success(msg.title, {
        description: msg.desc,
        action: {
          label: "Ver detalle",
          onClick: () => router.push(`/dashboard/bookings/${bookingId}`),
        },
        duration: 5000,
      });
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Provider actions */}
      {isProvider && status === "PENDING" && (
        <>
          <Button
            onClick={() => handleAction("CONFIRMED")}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Confirmar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction("CANCELLED")}
            className="text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
        </>
      )}

      {/* Check-in/Check-out buttons are now handled by CheckinButton component */}

      {/* Client actions */}
      {isClient && (status === "PENDING" || status === "CONFIRMED") && (
        <Button
          variant="outline"
          onClick={() => handleAction("CANCELLED")}
          className="text-red-600"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar Reserva
        </Button>
      )}
    </div>
  );
}

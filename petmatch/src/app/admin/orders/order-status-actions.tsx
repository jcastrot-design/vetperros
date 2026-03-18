"use client";

import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Package, Truck, CheckCircle2 } from "lucide-react";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter();

  async function handleUpdate(status: string) {
    const result = await updateOrderStatus(orderId, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Estado actualizado");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2 pt-2 border-t">
      {currentStatus === "PAID" && (
        <Button size="sm" onClick={() => handleUpdate("SHIPPED")} className="bg-purple-600 hover:bg-purple-700">
          <Truck className="h-4 w-4 mr-1" />
          Marcar como Enviado
        </Button>
      )}
      {currentStatus === "SHIPPED" && (
        <Button size="sm" onClick={() => handleUpdate("DELIVERED")} className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Marcar como Entregado
        </Button>
      )}
      {(currentStatus === "PENDING" || currentStatus === "PAID") && (
        <Button size="sm" variant="outline" onClick={() => handleUpdate("CANCELLED")} className="text-red-600">
          Cancelar
        </Button>
      )}
      {currentStatus === "DELIVERED" && (
        <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          Completado
        </span>
      )}
      {currentStatus === "CANCELLED" && (
        <span className="text-sm text-muted-foreground">Pedido cancelado</span>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { OrderStatusActions } from "./order-status-actions";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Pagado", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Entregado", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        include: { product: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package className="h-6 w-6 text-orange-500" />
        Gestion de Pedidos
      </h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay pedidos</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            return (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.buyer.name} ({order.buyer.email})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={status.color}>{status.label}</Badge>
                      <p className="font-semibold">${order.totalAmount.toLocaleString("es-CL")}</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <span key={item.id} className="mr-3">
                        {item.quantity}x {item.product.title}
                      </span>
                    ))}
                  </div>

                  {order.shippingAddress && (
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      Envio: {order.shippingAddress}
                    </p>
                  )}

                  <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

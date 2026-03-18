import { getOrders } from "@/lib/actions/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, PackageOpen } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  PAID: { label: "Pagado", variant: "default" },
  SHIPPED: { label: "Enviado", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "outline" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package className="h-6 w-6 text-orange-500" />
        Mis Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold">No tienes pedidos</h2>
          <p className="text-muted-foreground text-sm">Tus compras apareceran aqui</p>
          <Button nativeButton={false} render={<Link href="/marketplace" />} className="bg-brand hover:bg-brand-hover">
            Ir al marketplace
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.PENDING;
            return (
              <Link key={order.id} href={`/marketplace/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="font-semibold">
                        ${order.totalAmount.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const photos = JSON.parse(item.product.photos || "[]") as string[];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          {photos[0] ? (
                            <img
                              src={photos[0]}
                              alt={item.product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <PackageOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}x ${item.unitPrice.toLocaleString("es-CL")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.shippingAddress && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Envio: {order.shippingAddress}
                    </p>
                  )}
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

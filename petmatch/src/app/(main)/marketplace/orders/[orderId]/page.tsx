import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, PackageOpen, MapPin, ArrowLeft, Star } from "lucide-react";
import { RateOrderButton } from "./rate-order-button";
import Link from "next/link";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  PENDING: { label: "Pendiente de pago", variant: "secondary", color: "text-yellow-700 bg-yellow-100" },
  PAID: { label: "Pagado", variant: "default", color: "text-blue-700 bg-blue-100" },
  SHIPPED: { label: "Enviado", variant: "default", color: "text-purple-700 bg-purple-100" },
  DELIVERED: { label: "Entregado", variant: "outline", color: "text-green-700 bg-green-100" },
  CANCELLED: { label: "Cancelado", variant: "destructive", color: "text-red-700 bg-red-100" },
};

const statusSteps = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session) notFound();

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, title: true, photos: true } },
        },
      },
    },
  });

  if (!order) notFound();

  // Only buyer or admin can view
  const isAdmin = session.user.role === "ADMIN";
  if (order.buyerId !== session.user.id && !isAdmin) notFound();

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const currentStep = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/marketplace/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-500" />
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const stepInfo = statusConfig[step];
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive
                          ? isCurrent ? stepInfo.color : "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                      {stepInfo.label}
                    </span>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 ${
                          i < currentStep ? "bg-green-400" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <Badge className={status.color}>{status.label}</Badge>
            <p className="text-sm text-muted-foreground mt-2">Este pedido fue cancelado</p>
          </CardContent>
        </Card>
      )}

      {/* Order items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => {
            const photos = JSON.parse(item.product.photos || "[]") as string[];
            return (
              <div key={item.id} className="flex items-center gap-4">
                {photos[0] ? (
                  <img
                    src={photos[0]}
                    alt={item.product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <PackageOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/marketplace/${item.product.id}`} className="font-medium hover:underline">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.unitPrice * item.quantity).toLocaleString("es-CL")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${item.unitPrice.toLocaleString("es-CL")} c/u
                  </p>
                </div>
              </div>
            );
          })}

          <div className="border-t pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${order.totalAmount.toLocaleString("es-CL")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping info */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Direccion de envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmar recepción / calificación */}
      {!isAdmin && ["SHIPPED", "DELIVERED"].includes(order.status) && !order.buyerRating && (
        <RateOrderButton orderId={order.id} />
      )}

      {/* Calificación existente */}
      {order.buyerRating && (
        <Card className="border-green-200">
          <CardContent className="pt-4 space-y-1">
            <p className="text-sm font-medium text-green-700 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Calificaste este pedido con {order.buyerRating}/5 estrellas
            </p>
            {order.buyerReview && (
              <p className="text-sm text-muted-foreground">"{order.buyerReview}"</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin info */}
      {isAdmin && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-base">Info del comprador</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Nombre:</span> {order.buyer.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {order.buyer.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

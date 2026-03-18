"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Loader2, ShieldCheck, PackageOpen, Tag, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { validateCoupon } from "@/lib/actions/game";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">No hay productos para pagar</h2>
        <Button nativeButton={false} render={<Link href="/marketplace" />} className="bg-brand hover:bg-brand-hover">
          Ir al marketplace
        </Button>
      </div>
    );
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode);
      if ("error" in result) {
        toast.error(result.error);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: result.code, discount: result.discount });
        toast.success(`Cupón aplicado: ${result.discount}% de descuento`);
      }
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleCheckout() {
    if (!address.trim()) {
      toast.error("Ingresa una direccion de envio");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const shippingAddress = notes ? `${address}\n${notes}` : address;

      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems, shippingAddress, couponCode: appliedCoupon?.code }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Error al procesar el pago");
        return;
      }

      clearCart();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.success("Pedido creado exitosamente!");
        router.push("/marketplace/orders");
      }
    } catch {
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-orange-500" />
        Checkout
      </h1>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Direccion de envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Direccion</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. Providencia 1234, Santiago"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Depto, instrucciones de entrega..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-500" />
                Cupón de descuento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600 dark:text-green-500">{appliedCoupon.discount}% de descuento aplicado</p>
                    </div>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-muted-foreground hover:text-foreground">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ej: PERRO5-ABC12"
                    className="font-mono text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button onClick={handleApplyCoupon} variant="outline" disabled={couponLoading || !couponCode.trim()} size="sm" className="whitespace-nowrap">
                    {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Gana cupones jugando Perro Corredor 🎮</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metodo de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Pago seguro con Stripe</p>
                  <p className="text-xs text-muted-foreground">
                    Seras redirigido a Stripe para completar el pago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.quantity}x {item.title}
                    </span>
                    <span>${(item.price * item.quantity).toLocaleString("es-CL")}</span>
                  </div>
                ))}
              </div>
              {appliedCoupon && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalPrice().toLocaleString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({appliedCoupon.discount}%)</span>
                    <span>-${Math.round(totalPrice() * appliedCoupon.discount / 100).toLocaleString("es-CL")}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  ${(appliedCoupon
                    ? Math.round(totalPrice() * (1 - appliedCoupon.discount / 100))
                    : totalPrice()
                  ).toLocaleString("es-CL")}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-brand hover:bg-brand-hover"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar pedido
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/marketplace/cart" />} className="w-full">
                Volver al carrito
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

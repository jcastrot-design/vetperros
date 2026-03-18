"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PayBookingButtonProps {
  bookingId: string;
  totalPrice: number;
}

export function PayBookingButton({ bookingId, totalPrice }: PayBookingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.error(data.error || "No se pudo iniciar el pago");
    } catch {
      toast.error("Error al conectar con el sistema de pago");
    }
    setLoading(false);
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">El proveedor acepto tu reserva</p>
            <p className="text-sm text-green-700">
              Completa el pago de ${totalPrice.toLocaleString()} CLP para confirmar
            </p>
          </div>
        </div>
        <Button
          onClick={handlePay}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Pagar ${totalPrice.toLocaleString()} CLP
        </Button>
      </CardContent>
    </Card>
  );
}

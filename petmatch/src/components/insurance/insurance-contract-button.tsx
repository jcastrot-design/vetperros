"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
}

interface InsuranceContractButtonProps {
  planId: string;
  planName: string;
  price: number;
  annualPrice?: number;
  isLoggedIn: boolean;
}

export function InsuranceContractButton({
  planId,
  planName,
  price,
  annualPrice,
  isLoggedIn,
}: InsuranceContractButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petId, setPetId] = useState("");
  const [period, setPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }
    setLoadingPets(true);
    setOpen(true);
    try {
      const res = await fetch("/api/my-pets");
      const data = await res.json();
      setPets(data);
      if (data.length === 1) setPetId(data[0].id);
    } catch {
      toast.error("No se pudieron cargar tus mascotas");
    }
    setLoadingPets(false);
  }

  async function handleCheckout() {
    if (!petId) {
      toast.error("Selecciona una mascota");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/insurance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, petId, period }),
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

  const selectedAmount = period === "ANNUAL" && annualPrice ? annualPrice : price;

  return (
    <>
      <Button
        onClick={handleOpen}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
      >
        <Shield className="mr-2 h-4 w-4" />
        Contratar seguro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Contratar {planName}
            </DialogTitle>
            <DialogDescription>
              Selecciona la mascota y el período de cobertura.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Pet selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Mascota</label>
              {loadingPets ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando mascotas…
                </div>
              ) : pets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tienes mascotas registradas.{" "}
                  <a href="/pets/new" className="underline text-blue-600">
                    Registra una
                  </a>{" "}
                  para contratar un seguro.
                </p>
              ) : (
                <Select value={petId} onValueChange={(v) => { if (v) setPetId(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.breed ? ` — ${p.breed}` : ""} ({p.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Period selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Período de pago</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod("MONTHLY")}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    period === "MONTHLY"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                      : "border-muted-foreground/20 hover:border-blue-400"
                  }`}
                >
                  Mensual
                  <span className="block text-xs font-normal">
                    ${price.toLocaleString("es-CL")} / mes
                  </span>
                </button>
                {annualPrice && (
                  <button
                    type="button"
                    onClick={() => setPeriod("ANNUAL")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      period === "ANNUAL"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                        : "border-muted-foreground/20 hover:border-blue-400"
                    }`}
                  >
                    Anual
                    <span className="block text-xs font-normal">
                      ${annualPrice.toLocaleString("es-CL")} / año
                    </span>
                    <span className="block text-xs text-green-600 font-medium">
                      Ahorra {Math.round(100 - (annualPrice / (price * 12)) * 100)}%
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Período</span>
                <span>{period === "ANNUAL" ? "Anual" : "Mensual"}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t">
                <span>Total a pagar</span>
                <span>${selectedAmount.toLocaleString("es-CL")} CLP</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading || !petId || loadingPets}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Pagar ${selectedAmount.toLocaleString("es-CL")} CLP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

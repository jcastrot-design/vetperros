"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, X, Siren, MapPin, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  is24h: boolean;
  latitude: number | null;
  longitude: number | null;
}

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState<VetClinic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetch("/api/vets/emergency")
      .then((res) => res.json())
      .then((data) => setClinics(data))
      .catch(() => setClinics([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Emergencia veterinaria"
      >
        <Siren className="h-6 w-6" />
      </button>

      {/* Emergency panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md mx-4 mb-4 md:mb-0 border-red-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <Siren className="h-5 w-5" />
                  Emergencia Veterinaria
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Si tu mascota tiene una emergencia, contacta de inmediato:
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              )}

              {!loading && clinics.length === 0 && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No hay clinicas de emergencia registradas
                  </p>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/vets" />}
                  >
                    Ver veterinarias disponibles
                  </Button>
                </div>
              )}

              {!loading &&
                clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{clinic.name}</p>
                      {clinic.is24h && (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-300 text-green-700"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          24h
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{clinic.address}</span>
                    </div>
                    <Button
                      className="w-full bg-red-500 hover:bg-red-600"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a
                          href={`tel:${clinic.phone}`}
                        />
                      }
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                  </div>
                ))}

              {!loading && clinics.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    En caso de emergencia grave, acude directamente a la clinica
                    veterinaria mas cercana.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, DollarSign, PawPrint, Check, Clock } from "lucide-react";
import { createBooking, calculateBookingPrice } from "@/lib/actions/bookings";
import { toast } from "sonner";

interface PetOption {
  id: string;
  name: string;
  species: string;
  breed: string | null;
}

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mie", THURSDAY: "Jue",
  FRIDAY: "Vie", SATURDAY: "Sab", SUNDAY: "Dom",
};

const DAY_TO_JS: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

const JS_TO_DAY: Record<number, string> = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

export default function BookServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [petId, setPetId] = useState("");
  const [recurrence, setRecurrence] = useState<string>("");
  const [pets, setPets] = useState<PetOption[]>([]);
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [pricing, setPricing] = useState<{
    subtotal: number;
    serviceFee: number;
    totalPrice: number;
    hours: number;
    pricePerUnit: number;
  } | null>(null);

  const [bookedSlots, setBookedSlots] = useState<{ start: string; end: string }[]>([]);

  // Load user's pets and service availability + booked slots
  useEffect(() => {
    fetch("/api/my-pets")
      .then((r) => r.json())
      .then((data) => {
        setPets(data);
        if (data.length === 1) setPetId(data[0].id);
        setPetsLoaded(true);
      })
      .catch(() => setPetsLoaded(true));

    fetch(`/api/services/${serviceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) setAvailability(data.availability);
        if (data.bookedSlots) setBookedSlots(data.bookedSlots);
      })
      .catch(() => {});
  }, [serviceId]);

  useEffect(() => {
    if (startDate && endDate) {
      calculateBookingPrice(serviceId, startDate, endDate).then((result) => {
        if ("error" in result) return;
        setPricing(result);
      });
    } else {
      setPricing(null);
    }
  }, [startDate, endDate, serviceId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createBooking({
      serviceId,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      notes: (formData.get("notes") as string) || undefined,
      petId: petId || undefined,
      recurrence: recurrence ? (recurrence as "WEEKLY" | "BIWEEKLY" | "MONTHLY") : undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Solicitud enviada!", {
      description: "El proveedor revisara tu solicitud y te confirmaremos cuando acepte.",
    });
    router.push(`/dashboard/bookings/${result.bookingId}`);
  }

  const step = !petId && pets.length > 0 ? 1
    : !startDate || !endDate ? 2
    : 3;

  const steps = [
    { label: "Mascota", done: !!petId || pets.length === 0 },
    { label: "Fecha", done: !!startDate && !!endDate },
    { label: "Confirmar", done: false },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Visual stepper */}
      <div className="flex items-center justify-center gap-1 px-4">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                s.done ? "bg-green-500 text-white"
                  : i + 1 === step ? "bg-orange-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i + 1 === step ? "font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${s.done ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            Reservar Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Pet selector */}
            {petsLoaded && pets.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <PawPrint className="h-4 w-4" />
                  Mascota
                </Label>
                <div className="grid gap-2 grid-cols-2">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setPetId(pet.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        petId === pet.id
                          ? "border-orange-500 bg-orange-50"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pet.breed || pet.species}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {petsLoaded && pets.length === 0 && (
              <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-yellow-50">
                No tienes mascotas registradas. Puedes agregar una desde tu perfil.
              </div>
            )}

            {/* Availability hint */}
            {availability.length > 0 && (
              <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Disponibilidad del proveedor
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availability.map((slot, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {DAY_LABELS[slot.dayOfWeek]} {slot.startTime}-{slot.endTime}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick date picker: next 14 days */}
            {availability.length > 0 && (
              <div className="space-y-2">
                <Label>Seleccionar dia</Label>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    const dayName = JS_TO_DAY[date.getDay()];
                    const isAvailable = availability.some((s) => s.dayOfWeek === dayName);
                    const dateStr = date.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateStr;
                    const hasBooking = bookedSlots.some((s) =>
                      s.start.startsWith(dateStr),
                    );

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedDate(dateStr);
                        }}
                        className={`p-1.5 rounded text-center text-xs transition-colors ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : isAvailable
                              ? "bg-muted hover:bg-orange-100 cursor-pointer"
                              : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-medium">
                          {date.toLocaleDateString("es-CL", { weekday: "narrow" })}
                        </div>
                        <div>{date.getDate()}</div>
                        {hasBooking && isAvailable && (
                          <div className="h-1 w-1 rounded-full bg-red-400 mx-auto mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {bookedSlots.length > 0 && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-400" /> Horario parcialmente ocupado
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Time slot picker for selected day */}
            {selectedDate && (() => {
              const selDay = JS_TO_DAY[new Date(selectedDate + "T12:00:00").getDay()];
              const daySlots = availability.filter((s) => s.dayOfWeek === selDay);

              if (daySlots.length === 0) return null;

              return (
                <div className="space-y-2">
                  <Label>Horarios disponibles</Label>
                  <div className="grid gap-2 grid-cols-2">
                    {daySlots.map((slot, i) => {
                      const slotStart = `${selectedDate}T${slot.startTime}`;
                      const slotEnd = `${selectedDate}T${slot.endTime}`;
                      const isSelected = startDate === slotStart && endDate === slotEnd;
                      const hasConflict = bookedSlots.some((b) => {
                        if (!b.start.startsWith(selectedDate)) return false;
                        const bStart = b.start.slice(11, 16);
                        const bEnd = b.end.slice(11, 16);
                        return bStart < slot.endTime && bEnd > slot.startTime;
                      });

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setStartDate(slotStart);
                            setEndDate(slotEnd);
                          }}
                          className={`p-3 border rounded-lg text-sm text-left transition-colors ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                            {hasConflict && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                                Parcial
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha y hora de inicio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha y hora de fin</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label>Repetir reserva</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "", label: "Una vez" },
                  { value: "WEEKLY", label: "Semanal" },
                  { value: "BIWEEKLY", label: "Quincenal" },
                  { value: "MONTHLY", label: "Mensual" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecurrence(opt.value)}
                    className={`p-2 border rounded-lg text-xs font-medium transition-colors ${
                      recurrence === opt.value
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {recurrence && (
                <p className="text-xs text-muted-foreground">
                  Se crearan 4 reservas futuras automaticamente con el mismo horario.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Indicaciones especiales, alergias, etc."
                rows={3}
              />
            </div>

            {/* Price summary */}
            {pricing && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Resumen de precio</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>${pricing.pricePerUnit.toLocaleString()}/hr x {pricing.hours}h</span>
                  <span>${pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Cargo por servicio (7%)</span>
                  <span>${pricing.serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">${pricing.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Cancellation policy */}
            <div className="text-xs text-muted-foreground p-3 border rounded-lg">
              <p className="font-medium mb-1">Politica de cancelacion:</p>
              <ul className="space-y-0.5">
                <li>Mas de 48h antes: reembolso 100%</li>
                <li>Entre 24-48h: reembolso 50%</li>
                <li>Menos de 24h: sin reembolso</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-brand hover:bg-brand-hover"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Reserva
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

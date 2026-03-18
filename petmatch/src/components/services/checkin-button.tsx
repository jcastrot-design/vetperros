"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { checkinBooking, checkoutBooking } from "@/lib/actions/bookings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Loader2, LogIn, LogOut } from "lucide-react";

interface CheckinButtonProps {
  bookingId: string;
  type: "checkin" | "checkout";
}

export function CheckinButton({ bookingId, type }: CheckinButtonProps) {
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);

    try {
      // 1. Get geolocation (optional — proceed without if denied)
      let lat: number | null = null;
      let lng: number | null = null;

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
          }),
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // GPS not available — continue without it
      }

      // 2. Open file picker for photo
      fileRef.current?.click();

      const file = await new Promise<File | null>((resolve) => {
        const input = fileRef.current;
        if (!input) return resolve(null);

        const handler = () => {
          input.removeEventListener("change", handler);
          resolve(input.files?.[0] || null);
        };
        input.addEventListener("change", handler);

        // If user cancels file picker, resolve null after a timeout
        setTimeout(() => {
          input.removeEventListener("change", handler);
          resolve(null);
        }, 60000);
      });

      // 3. Upload photo if selected
      let photoUrl: string | null = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          photoUrl = data.url;
        }
      }

      // 4. Call server action
      const action = type === "checkin" ? checkinBooking : checkoutBooking;
      const result = await action(bookingId, lat, lng, photoUrl);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          type === "checkin"
            ? "Check-in realizado"
            : "Check-out realizado — Servicio completado",
        );
        router.refresh();
      }
    } catch {
      toast.error("Error al procesar. Intenta de nuevo.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isCheckin = type === "checkin";

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <Button
        onClick={handleClick}
        disabled={loading}
        className={
          isCheckin
            ? "bg-purple-500 hover:bg-purple-600 w-full h-14 text-base"
            : "bg-green-500 hover:bg-green-600 w-full h-14 text-base"
        }
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : isCheckin ? (
          <LogIn className="h-5 w-5 mr-2" />
        ) : (
          <LogOut className="h-5 w-5 mr-2" />
        )}
        {loading
          ? "Procesando..."
          : isCheckin
            ? "Check-in: Llegue"
            : "Check-out: Termine"}
      </Button>
      {!loading && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1">
            <Camera className="h-3 w-3" /> Foto de evidencia
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Ubicacion GPS
          </span>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Play, Square, Timer, Route } from "lucide-react";
import { startTracking, updateTracking, endTracking, getTrackingData } from "@/lib/actions/tracking";
import { toast } from "sonner";

interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

interface LiveTrackingMapProps {
  bookingId: string;
  isProvider: boolean;
  bookingStatus: string;
}

export function LiveTrackingMap({ bookingId, isProvider, bookingStatus }: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [coords, setCoords] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Load existing tracking data
  useEffect(() => {
    getTrackingData(bookingId).then((data) => {
      if (!data) return;
      setTrackingId(data.id);
      setIsActive(data.isActive);
      const parsedCoords = JSON.parse(data.coordinates || "[]");
      setCoords(parsedCoords);
      if (data.totalDistance) setDistance(data.totalDistance);
      if (data.totalDuration) setDuration(data.totalDuration);
      if (data.isActive && parsedCoords.length > 0) {
        setStartTime(parsedCoords[0].timestamp);
      }
    });
  }, [bookingId]);

  // Timer
  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      setDuration(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = coords.length > 0
        ? [coords[coords.length - 1].lat, coords[coords.length - 1].lng]
        : [-33.4489, -70.6693];

      const map = L.map(mapRef.current!, { center, zoom: 15 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      if (coords.length > 0) {
        const latLngs = coords.map((c) => [c.lat, c.lng] as [number, number]);
        polylineRef.current = L.polyline(latLngs, { color: "#ea580c", weight: 4 }).addTo(map);
        markerRef.current = L.marker(latLngs[latLngs.length - 1]).addTo(map);
        if (latLngs.length > 1) {
          map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
        }
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when coords change
  const updateMap = useCallback((newCoords: Coordinate[]) => {
    if (!mapInstanceRef.current || newCoords.length === 0) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current!;
      const latLngs = newCoords.map((c) => [c.lat, c.lng] as [number, number]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latLngs);
      } else {
        polylineRef.current = L.polyline(latLngs, { color: "#ea580c", weight: 4 }).addTo(map);
      }

      const lastPos = latLngs[latLngs.length - 1];
      if (markerRef.current) {
        markerRef.current.setLatLng(lastPos);
      } else {
        markerRef.current = L.marker(lastPos).addTo(map);
      }

      map.panTo(lastPos);
    });
  }, []);

  async function handleStart() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalizacion");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await startTracking(bookingId, pos.coords.latitude, pos.coords.longitude);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        setTrackingId(result.trackingId!);
        setIsActive(true);
        setStartTime(Date.now());
        const initialCoord = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() };
        setCoords([initialCoord]);
        updateMap([initialCoord]);
        toast.success("Tracking iniciado");

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (p) => {
            const coord = { lat: p.coords.latitude, lng: p.coords.longitude, timestamp: Date.now() };
            setCoords((prev) => {
              const updated = [...prev, coord];
              updateMap(updated);
              return updated;
            });
            if (result.trackingId) {
              const updateResult = await updateTracking(result.trackingId, p.coords.latitude, p.coords.longitude);
              if (updateResult.distance) setDistance(updateResult.distance * 1000);
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
        );
      },
      () => toast.error("No se pudo obtener la ubicacion"),
    );
  }

  async function handleStop() {
    if (!trackingId) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const result = await endTracking(trackingId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setIsActive(false);
    if (result.distance) setDistance(result.distance * 1000);
    if (result.durationSec) setDuration(result.durationSec);
    toast.success("Tracking finalizado");
  }

  function formatDuration(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }

  function formatDistance(meters: number) {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  }

  // Only show for WALK type bookings in IN_PROGRESS or COMPLETED
  if (bookingStatus !== "IN_PROGRESS" && bookingStatus !== "COMPLETED" && !trackingId) {
    return null;
  }

  return (
    <Card>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Seguimiento GPS
          </span>
          {isActive && (
            <Badge className="bg-green-500 animate-pulse">En vivo</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duracion</p>
              <p className="font-semibold text-sm">{formatDuration(duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Route className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Distancia</p>
              <p className="font-semibold text-sm">{formatDistance(distance)}</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ height: 300, width: "100%" }} className="rounded-lg overflow-hidden" />

        {/* Controls - only for provider */}
        {isProvider && bookingStatus === "IN_PROGRESS" && (
          <div className="flex gap-2">
            {!isActive && !trackingId && (
              <Button onClick={handleStart} className="flex-1 bg-green-500 hover:bg-green-600">
                <Play className="h-4 w-4 mr-1.5" />
                Iniciar tracking
              </Button>
            )}
            {isActive && (
              <Button onClick={handleStop} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-1.5" />
                Detener tracking
              </Button>
            )}
          </div>
        )}

        {coords.length === 0 && !isActive && (
          <p className="text-sm text-center text-muted-foreground">
            {isProvider ? "Inicia el tracking para registrar la ruta del paseo" : "El tracking aun no ha sido iniciado"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

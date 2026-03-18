"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

interface ServiceMarker {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  providerName: string;
  type: string;
}

interface ServiceMapProps {
  services: ServiceMarker[];
  onMarkerClick?: (serviceId: string) => void;
}

export function ServiceMap({ services, onMarkerClick }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    // Guard against Leaflet "already initialized" in React Strict Mode
    if ((mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const markersWithCoords = services.filter((s) => s.latitude && s.longitude);

      // Default center: Santiago, Chile
      const center: [number, number] = markersWithCoords.length > 0
        ? [markersWithCoords[0].latitude, markersWithCoords[0].longitude]
        : [-33.4489, -70.6693];

      const map = L.map(mapRef.current!, {
        center,
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      markersWithCoords.forEach((service) => {
        const marker = L.marker([service.latitude, service.longitude]).addTo(map);
        marker.bindPopup(`
          <div style="min-width:150px">
            <strong>${service.title}</strong><br/>
            <span style="color:#666">${service.providerName}</span><br/>
            <strong style="color:#ea580c">$${service.price.toLocaleString()}</strong>
          </div>
        `);
        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(service.id));
        }
      });

      // Fit bounds if multiple markers
      if (markersWithCoords.length > 1) {
        const bounds = L.latLngBounds(
          markersWithCoords.map((s) => [s.latitude, s.longitude] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
      setLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [services, onMarkerClick]);

  return (
    <Card className="overflow-hidden">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} style={{ height: 400, width: "100%" }} />
    </Card>
  );
}

export function MapToggle({
  services,
  children,
}: {
  services: ServiceMarker[];
  children: React.ReactNode;
}) {
  const [showMap, setShowMap] = useState(false);
  const markersWithCoords = services.filter((s) => s.latitude && s.longitude);

  if (markersWithCoords.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? (
            <>
              <List className="h-4 w-4 mr-1.5" />
              Ver lista
            </>
          ) : (
            <>
              <Map className="h-4 w-4 mr-1.5" />
              Ver mapa
            </>
          )}
        </Button>
      </div>
      {showMap && <ServiceMap services={markersWithCoords} />}
      {children}
    </div>
  );
}

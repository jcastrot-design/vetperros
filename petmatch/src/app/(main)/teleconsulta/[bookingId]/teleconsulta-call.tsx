"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeleconsultaCallProps {
  roomUrl: string;
  token: string;
  userName: string;
}

export function TeleconsultaCall({ roomUrl, token, userName }: TeleconsultaCallProps) {
  const [joined, setJoined] = useState(false);
  const [ended, setEnded] = useState(false);
  const router = useRouter();

  const iframeUrl = `${roomUrl}?t=${token}&userName=${encodeURIComponent(userName)}&embed=true`;

  if (ended) {
    return (
      <div className="rounded-xl bg-gray-900 text-white flex flex-col items-center justify-center gap-4 py-20">
        <PhoneOff className="h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold">Consulta finalizada</p>
        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="rounded-xl bg-gray-900 text-white flex flex-col items-center justify-center gap-6 py-20">
        <div className="h-20 w-20 rounded-full bg-blue-600/30 flex items-center justify-center">
          <Video className="h-10 w-10 text-blue-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">Sala lista</p>
          <p className="text-sm text-gray-400">Conectando como <span className="text-white">{userName}</span></p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 px-8"
            onClick={() => setJoined(true)}
          >
            <Video className="h-4 w-4 mr-2" />
            Unirse a la consulta
          </Button>
        </div>
        <p className="text-xs text-gray-500 max-w-sm text-center">
          Al unirte se habilitará tu cámara y micrófono. Asegúrate de estar en un lugar tranquilo y bien iluminado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ height: "70vh" }}>
        <iframe
          src={iframeUrl}
          allow="camera *; microphone *; autoplay *; display-capture *; fullscreen *"
          className="w-full h-full border-0"
          title="Teleconsulta"
        />
      </div>
      <div className="flex justify-center">
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => setEnded(true)}
        >
          <PhoneOff className="h-4 w-4" />
          Finalizar consulta
        </Button>
      </div>
    </div>
  );
}

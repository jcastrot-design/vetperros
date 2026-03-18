"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    // Show prompt if not yet decided and not dismissed recently
    if (Notification.permission === "default") {
      const dismissed = localStorage.getItem("push-prompt-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        // Wait 5 seconds before showing
        const timer = setTimeout(() => setShow(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  async function handleEnable() {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShow(false);

      if (result === "granted") {
        // Show a test notification
        new Notification("PetMatch", {
          body: "Las notificaciones estan activadas. Te avisaremos sobre reservas, mensajes y mas.",
          icon: "/favicon.ico",
        });
      }
    } catch {
      setShow(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem("push-prompt-dismissed", Date.now().toString());
    setShow(false);
  }

  if (!show || permission !== "default") return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 border-orange-200 shadow-lg">
      <CardContent className="pt-4 pb-3">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Activar notificaciones</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recibe alertas de reservas, mensajes y recordatorios al instante.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleEnable}
                className="bg-brand hover:bg-brand-hover"
              >
                Activar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="shrink-0 self-start">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

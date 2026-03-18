"use client";

import { Button } from "@/components/ui/button";
import { Printer, Link2, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function PassportActions() {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleDownloadQR = async () => {
    const passportUrl = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(passportUrl)}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "petmatch-qr.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("QR descargado");
    } catch {
      toast.error("No se pudo descargar el QR");
    }
  };

  return (
    <div className="flex gap-2 justify-center print:hidden">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copiado" : "Copiar enlace"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadQR}>
        <Download className="h-4 w-4" />
        Descargar QR
      </Button>
    </div>
  );
}

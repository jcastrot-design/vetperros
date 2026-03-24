"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Loader2 } from "lucide-react";
import { reportSighting } from "@/lib/actions/lost-pets";
import { toast } from "sonner";

export function ReportSightingButton({ lostPetId }: { lostPetId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const result = await reportSighting({
      lostPetId,
      description: (form.get("description") as string) || undefined,
      address: (form.get("address") as string) || undefined,
    });
    setLoading(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Avistamiento reportado. ¡Gracias por ayudar!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="w-full bg-amber-500 hover:bg-amber-600">
          <MessageCircle className="h-4 w-4 mr-2" />
          Reportar avistamiento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Viste a esta mascota?</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">¿Dónde la viste?</Label>
            <Input id="address" name="address" placeholder="Ej: Av. Providencia 1234, Santiago" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Detalles</Label>
            <Textarea id="description" name="description" placeholder="Cómo estaba, con quién, cualquier detalle útil..." rows={3} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar reporte
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

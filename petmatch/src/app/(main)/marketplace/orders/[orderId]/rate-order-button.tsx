"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Loader2, PackageCheck } from "lucide-react";
import { confirmAndRate } from "@/lib/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RateOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Selecciona una calificación"); return; }
    setLoading(true);
    const result = await confirmAndRate(orderId, rating, review);
    setLoading(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("¡Gracias por tu calificación! El pago fue liberado al vendedor.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="w-full bg-green-500 hover:bg-green-600">
          <PackageCheck className="h-4 w-4 mr-2" />
          Confirmar recepción y calificar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Recibiste tu pedido?</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Comentario (opcional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="¿Cómo fue tu experiencia?"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar y calificar
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

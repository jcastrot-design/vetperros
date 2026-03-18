"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { RatingStars } from "@/components/shared/rating-stars";
import { createReview } from "@/lib/actions/reviews";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  providerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, providerName, onSuccess }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [careRating, setCareRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [comment, setComment] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Selecciona una calificacion general");
      return;
    }
    setLoading(true);

    const result = await createReview({
      bookingId,
      rating,
      punctualityRating: punctualityRating || undefined,
      careRating: careRating || undefined,
      communicationRating: communicationRating || undefined,
      comment: comment || undefined,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Resena enviada", {
        description: `Gracias por calificar a ${providerName}`,
        duration: 4000,
      });
      onSuccess?.();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dejar resena para {providerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General rating */}
          <div className="space-y-2">
            <Label>Calificacion general *</Label>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Sub-ratings */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-sm">Puntualidad</Label>
              <RatingStars value={punctualityRating} onChange={setPunctualityRating} size="sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Cuidado</Label>
              <RatingStars value={careRating} onChange={setCareRating} size="sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Comunicacion</Label>
              <RatingStars value={communicationRating} onChange={setCommunicationRating} size="sm" />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Comentario</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuenta tu experiencia..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-hover"
            disabled={loading || rating === 0}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar resena
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

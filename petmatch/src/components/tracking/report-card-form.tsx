"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ClipboardList } from "lucide-react";
import { createReportCard } from "@/lib/actions/report-cards";
import { moodLabels, moodEmojis } from "@/lib/validations/report-card";
import { toast } from "sonner";

interface ReportCardFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

const activityOptions = [
  "Paseo", "Juego", "Entrenamiento", "Descanso",
  "Socializacion", "Bano", "Cepillado",
];

export function ReportCardForm({ bookingId, onSuccess }: ReportCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("HAPPY");
  const [activities, setActivities] = useState<string[]>([]);
  const [ateFood, setAteFood] = useState(false);
  const [drankWater, setDrankWater] = useState(false);
  const [didPoop, setDidPoop] = useState(false);
  const [didPee, setDidPee] = useState(false);
  const [notes, setNotes] = useState("");

  function toggleActivity(a: string) {
    setActivities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createReportCard({
      bookingId,
      mood,
      activities: JSON.stringify(activities),
      ateFood,
      drankWater,
      didPoop,
      didPee,
      notes: notes || undefined,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Reporte creado");
      onSuccess?.();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Report Card
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood */}
          <div className="space-y-2">
            <Label>Estado de animo</Label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(moodLabels).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={mood === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(key)}
                  className={mood === key ? "bg-brand hover:bg-brand-hover" : ""}
                >
                  {moodEmojis[key]} {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            <Label>Actividades realizadas</Label>
            <div className="flex gap-2 flex-wrap">
              {activityOptions.map((a) => (
                <Button
                  key={a}
                  type="button"
                  variant={activities.includes(a) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(a)}
                  className={activities.includes(a) ? "bg-brand hover:bg-brand-hover" : ""}
                >
                  {a}
                </Button>
              ))}
            </div>
          </div>

          {/* Needs */}
          <div className="grid gap-3 grid-cols-2">
            <div className="flex items-center gap-2">
              <Switch checked={ateFood} onCheckedChange={setAteFood} />
              <Label>Comio</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={drankWater} onCheckedChange={setDrankWater} />
              <Label>Bebio agua</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={didPoop} onCheckedChange={setDidPoop} />
              <Label>Hizo popo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={didPee} onCheckedChange={setDidPee} />
              <Label>Hizo pipi</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones, comportamiento, etc."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-hover"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar reporte
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

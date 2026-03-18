import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Check, X } from "lucide-react";
import { moodLabels, moodEmojis } from "@/lib/validations/report-card";

interface ReportCardViewProps {
  reportCard: {
    mood: string;
    activities: string;
    ateFood: boolean;
    drankWater: boolean;
    didPoop: boolean;
    didPee: boolean;
    notes: string | null;
    photos: string;
    booking: { provider: { name: string } };
  };
}

export function ReportCardView({ reportCard }: ReportCardViewProps) {
  const activities = (() => {
    try { return JSON.parse(reportCard.activities); } catch { return []; }
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5" />
          Report Card
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Por: {reportCard.booking.provider.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Estado de animo</p>
          <p className="text-lg">
            {moodEmojis[reportCard.mood]} {moodLabels[reportCard.mood]}
          </p>
        </div>

        {/* Activities */}
        {activities.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Actividades</p>
            <div className="flex gap-1.5 flex-wrap">
              {activities.map((a: string) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Needs */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Necesidades</p>
          <div className="grid gap-2 grid-cols-2">
            <NeedItem label="Comio" value={reportCard.ateFood} />
            <NeedItem label="Bebio agua" value={reportCard.drankWater} />
            <NeedItem label="Hizo popo" value={reportCard.didPoop} />
            <NeedItem label="Hizo pipi" value={reportCard.didPee} />
          </div>
        </div>

        {/* Notes */}
        {reportCard.notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Notas</p>
            <p className="text-sm">{reportCard.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NeedItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={value ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

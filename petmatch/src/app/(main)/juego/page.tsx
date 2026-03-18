import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyCoupons, getMyTopScore } from "@/lib/actions/game";
import { GameClient } from "./game-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Gift, AlertCircle } from "lucide-react";

export default async function JuegoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [topScore, coupons] = await Promise.all([getMyTopScore(), getMyCoupons()]);

  const activeCoupons = coupons.filter(c => !c.usedAt && c.expiresAt > new Date());
  const usedCoupons = coupons.filter(c => c.usedAt);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-orange-500" />
          Perro Corredor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Esquiva los obstáculos y gana cupones de descuento para el marketplace.
        </p>
      </div>

      {/* Game canvas */}
      <div className="w-full rounded-xl overflow-hidden bg-[#1a1a2e] p-3">
        <GameClient serverTopScore={topScore} />
      </div>

      {/* Score tiers info */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { pts: "200+", pct: "5%", color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400" },
          { pts: "500+", pct: "10%", color: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400" },
          { pts: "1000+", pct: "15%", color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400" },
        ].map(({ pts, pct, color }) => (
          <div key={pts} className={`rounded-lg border p-3 ${color}`}>
            <p className="text-lg font-bold">{pct}</p>
            <p className="text-xs font-medium mt-0.5">{pts} puntos</p>
          </div>
        ))}
      </div>

      {/* Personal best */}
      {topScore > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">Tu récord personal</p>
            <p className="text-xs text-muted-foreground">{topScore} puntos</p>
          </div>
        </div>
      )}

      {/* Active coupons */}
      {activeCoupons.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <Gift className="h-4 w-4 text-orange-500" />
            Cupones disponibles
          </h2>
          <div className="space-y-2">
            {activeCoupons.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-mono font-bold text-orange-600 tracking-wider">{c.code}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Vence: {new Date(c.expiresAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <Badge className="bg-orange-500">{c.discount}% OFF</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Used coupons */}
      {usedCoupons.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Cupones usados
          </h2>
          <div className="space-y-2">
            {usedCoupons.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border opacity-50">
                <p className="font-mono text-sm line-through">{c.code}</p>
                <Badge variant="secondary">{c.discount}% OFF</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <p>• Máximo 1 cupón por día.</p>
        <p>• Los cupones expiran a los 7 días.</p>
        <p>• Aplica el código al hacer checkout en el marketplace.</p>
      </div>
    </div>
  );
}

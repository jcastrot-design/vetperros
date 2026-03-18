import { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Trophy, Gift, X, RotateCcw } from "lucide-react-native";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get("window");
const GW = Math.min(SW - 24, 420);
const GH = 190;
const GY = 148;
const DOG_X = 62;
const DOG_W = 34;
const DOG_H = 34;
const GRAVITY = 1650;
const JUMP_VEL = -570;
const DBL_VEL = -510;
const INIT_SPD = 230;
const MAX_SPD = 720;
const SPD_INC = 13;
const SPF = 10;
const MILESTONES = [100, 250, 500, 1000, 2500];

const OBS_TYPES = [
  { type: "cat",     emoji: "🐱", w: 32, h: 46 },
  { type: "syringe", emoji: "💉", w: 22, h: 46 },
  { type: "shampoo", emoji: "🧴", w: 28, h: 46 },
];

interface Obs { id: number; x: number; emoji: string; w: number; h: number; }
interface GState {
  dogY: number; dogVY: number; jumpsUsed: number; onGround: boolean;
  obs: Obs[]; score: number; speed: number;
  phase: "start" | "playing" | "dead";
  spawnT: number; nextSpawn: number; lastId: number; animT: number;
  milestoneMsg: string; milestoneT: number;
}

function fresh(): GState {
  return {
    dogY: GY - DOG_H, dogVY: 0, jumpsUsed: 0, onGround: true,
    obs: [], score: 0, speed: INIT_SPD, phase: "start",
    spawnT: 0, nextSpawn: 1200, lastId: 0, animT: 0,
    milestoneMsg: "", milestoneT: 0,
  };
}

function pickObs(score: number) {
  const pool = [OBS_TYPES[0], OBS_TYPES[0]];
  if (score >= 300) pool.push(OBS_TYPES[1]);
  if (score >= 600) pool.push(OBS_TYPES[2]);
  return pool[Math.floor(Math.random() * pool.length)];
}

function nextSpawnMs(speed: number) {
  const t = (speed - INIT_SPD) / (MAX_SPD - INIT_SPD);
  return (1400 - 600 * Math.min(1, t)) + (Math.random() - 0.5) * 300;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
type CouponResult =
  | { type: "coupon"; code: string; discount: number }
  | { type: "alreadyEarned"; existingCode: string }
  | { type: "none" }
  | null;

export default function GameScreen() {
  const queryClient = useQueryClient();

  // All game physics in a mutable ref — no re-render overhead
  const g = useRef<GState>(fresh());
  const rafRef = useRef<number>(0);
  const lastTRef = useRef<number>(0);
  const milestonesHit = useRef(new Set<number>());
  const deadReported = useRef(false);

  // Single state counter to trigger a re-render each frame
  const [, setTick] = useState(0);
  const tick = () => setTick(n => n + 1);

  const [couponResult, setCouponResult] = useState<CouponResult>(null);
  const [finalScore, setFinalScore] = useState(0);

  const { data: gameData } = useQuery({
    queryKey: ["game-data"],
    queryFn: () => api.get("/mobile/game").then(r => r.data),
  });

  const scoreMutation = useMutation({
    mutationFn: (score: number) => api.post("/mobile/game", { score }).then(r => r.data),
    onSuccess: (data: any, score: number) => {
      setFinalScore(score);
      if (data.coupon) {
        setCouponResult({ type: "coupon", code: data.coupon.code, discount: data.coupon.discount });
        queryClient.invalidateQueries({ queryKey: ["game-data"] });
      } else if (data.alreadyEarned) {
        setCouponResult({ type: "alreadyEarned", existingCode: data.existingCode });
      } else {
        setCouponResult({ type: "none" });
      }
    },
  });

  // Keep mutation ref stable so game loop can call it without stale closure
  const mutatRef = useRef(scoreMutation.mutate);
  mutatRef.current = scoreMutation.mutate;

  // ── GAME LOOP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function loop(ts: number) {
      const s = g.current;
      const dt = Math.min((ts - lastTRef.current) / 1000, 0.05);
      lastTRef.current = ts;

      if (s.phase !== "playing") {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      s.animT += dt;
      s.speed = Math.min(MAX_SPD, s.speed + SPD_INC * dt);
      s.score += SPF * dt;

      // Dog physics
      s.dogVY += GRAVITY * dt;
      s.dogY += s.dogVY * dt;
      if (s.dogY >= GY - DOG_H) {
        s.dogY = GY - DOG_H;
        s.dogVY = 0;
        s.jumpsUsed = 0;
        s.onGround = true;
      }

      // Spawn
      s.spawnT += dt * 1000;
      if (s.spawnT >= s.nextSpawn) {
        s.spawnT = 0;
        s.nextSpawn = nextSpawnMs(s.speed);
        const ot = pickObs(s.score);
        s.obs.push({ id: ++s.lastId, x: GW + 20, emoji: ot.emoji, w: ot.w, h: ot.h });
      }

      // Move + despawn
      s.obs = s.obs.filter(o => { o.x -= s.speed * dt; return o.x + o.w > -20; });

      // Collision
      const dl = DOG_X + 6, dr = DOG_X + DOG_W - 8;
      const dt2 = s.dogY + 5, db = s.dogY + DOG_H - 2;
      for (const o of s.obs) {
        const ol = o.x + 4, or2 = o.x + o.w - 4;
        const ot2 = GY - o.h + 6;
        if (dr > ol && dl < or2 && db > ot2 && dt2 < GY) {
          s.phase = "dead";
          if (!deadReported.current) {
            deadReported.current = true;
            mutatRef.current(Math.floor(s.score));
          }
          break;
        }
      }

      // Milestones
      for (const m of MILESTONES) {
        if (s.score >= m && !milestonesHit.current.has(m)) {
          milestonesHit.current.add(m);
          s.milestoneMsg = `¡${m}!`;
          s.milestoneT = 1.5;
        }
      }
      if (s.milestoneT > 0) s.milestoneT -= dt;

      tick();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── INPUT ──────────────────────────────────────────────────────────────────
  function startNew() {
    const s = fresh();
    s.phase = "playing";
    g.current = s;
    milestonesHit.current.clear();
    deadReported.current = false;
    lastTRef.current = 0;
    setCouponResult(null);
    setFinalScore(0);
    tick();
  }

  function handleTap() {
    const s = g.current;
    if (s.phase === "start" || s.phase === "dead") {
      startNew();
    } else if (s.phase === "playing") {
      if (s.jumpsUsed === 0) {
        s.dogVY = JUMP_VEL;
        s.jumpsUsed = 1;
        s.onGround = false;
      } else if (s.jumpsUsed === 1) {
        s.dogVY = DBL_VEL;
        s.jumpsUsed = 2;
      }
    }
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const s = g.current;
  const topScore = (gameData as any)?.topScore ?? 0;
  const coupons: any[] = (gameData as any)?.coupons ?? [];
  const bounceY = s.phase === "playing" && s.onGround ? Math.sin(s.animT * 12) * 2 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#00c8b4" }}>🎮 Perro Corredor</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={20} color="#9ca3af" />
        </Pressable>
      </View>

      {/* ── GAME AREA — Pressable wraps everything, overlays have pointerEvents="none" ── */}
      <Pressable onPress={handleTap} style={{ marginHorizontal: 12 }}>
        <View style={{ width: GW, height: GH, backgroundColor: "#e8e4dc", borderRadius: 16, overflow: "hidden" }}>

          {/* Sky */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: GH - GY, backgroundColor: "#f0ede6" }} />

          {/* Decorative crosses */}
          {[80, 200, 340].map(cx => (
            <View key={cx} style={{ position: "absolute", top: 18, left: cx }}>
              <View style={{ width: 4, height: 20, backgroundColor: "rgba(0,200,180,0.18)" }} />
              <View style={{ position: "absolute", top: 8, left: -8, width: 20, height: 4, backgroundColor: "rgba(0,200,180,0.18)" }} />
            </View>
          ))}

          {/* Ground */}
          <View style={{ position: "absolute", top: GY, left: 0, right: 0, height: 2, backgroundColor: "#b0aca4" }} />
          <View style={{ position: "absolute", top: GY + 2, left: 0, right: 0, bottom: 0, backgroundColor: "#c8c4bc" }} />

          {/* Score */}
          {s.phase !== "start" && (
            <Text style={{ position: "absolute", top: 8, right: 12, fontSize: 12, fontWeight: "700", color: "#555" }}>
              {String(Math.floor(s.score)).padStart(5, "0")}
            </Text>
          )}

          {/* Milestone flash — pointerEvents none so tap still works */}
          {s.milestoneT > 0 && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#00c8b4", opacity: Math.min(1, s.milestoneT) }}>
                {s.milestoneMsg}
              </Text>
            </View>
          )}

          {/* Dog */}
          <Text style={{
            position: "absolute",
            left: DOG_X,
            top: s.dogY + bounceY,
            fontSize: 30,
            transform: s.phase === "dead" ? [{ rotate: "90deg" }] : [],
          }}>
            🐕
          </Text>

          {/* Obstacles */}
          {s.obs.map(o => (
            <Text key={o.id} style={{ position: "absolute", left: o.x, top: GY - o.h + 6, fontSize: 36 }}>
              {o.emoji}
            </Text>
          ))}

          {/* START overlay — pointerEvents none so Pressable gets the tap */}
          {s.phase === "start" && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(240,237,230,0.88)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#00c8b4" }}>PERRO</Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#a0602c" }}>CORREDOR</Text>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 10 }}>TAP PARA CORRER</Text>
              <Text style={{ fontSize: 10, color: "#00c8b4", marginTop: 4 }}>200 pts = cupón de descuento</Text>
            </View>
          )}

          {/* DEAD overlay — pointerEvents none */}
          {s.phase === "dead" && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,10,10,0.62)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#ff4466" }}>¡OH NO!</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#ffcc44", marginTop: 4 }}>{Math.floor(s.score)} PTS</Text>
              {Math.floor(s.score) > topScore && topScore > 0 && (
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#00c8b4", marginTop: 2 }}>¡NUEVO RÉCORD!</Text>
              )}
              <Text style={{ fontSize: 10, color: "#ddd", marginTop: 8 }}>TAP PARA INTENTAR OTRA VEZ</Text>
            </View>
          )}

        </View>
      </Pressable>

      {/* Score tiers */}
      <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 12, marginTop: 10 }}>
        {[
          { pts: "200+", pct: "5%",  bg: "#fef3c7", text: "#d97706" },
          { pts: "500+", pct: "10%", bg: "#ffedd5", text: "#f97316" },
          { pts: "1000+",pct: "15%", bg: "#fee2e2", text: "#dc2626" },
        ].map(({ pts, pct, bg, text }) => (
          <View key={pts} style={{ flex: 1, backgroundColor: bg, borderRadius: 10, padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: text }}>{pct}</Text>
            <Text style={{ fontSize: 11, color: text, marginTop: 2 }}>{pts} pts</Text>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, gap: 10 }} showsVerticalScrollIndicator={false}>
        {topScore > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 }}>
            <Trophy size={18} color="#fbbf24" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Tu récord personal</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>{topScore} puntos</Text>
            </View>
          </View>
        )}

        {coupons.length > 0 && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Gift size={14} color="#f97316" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Cupones disponibles</Text>
            </View>
            {coupons.map((c: any) => (
              <View key={c.code} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#f97316", letterSpacing: 1 }}>{c.code}</Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Vence: {new Date(c.expiresAt).toLocaleDateString("es-CL")}</Text>
                </View>
                <View style={{ backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{c.discount}% OFF</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>
          Máx. 1 cupón/día · Válido 7 días · Úsalo al pagar en marketplace
        </Text>
      </ScrollView>

      {/* Coupon result overlay */}
      {couponResult && couponResult.type !== "none" && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.78)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", alignItems: "center", gap: 12 }}>
            {couponResult.type === "coupon" ? (
              <>
                <Text style={{ fontSize: 40 }}>🎁</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>¡Ganaste un cupón!</Text>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>Puntuación: {finalScore}</Text>
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316", letterSpacing: 2 }}>{couponResult.code}</Text>
                  <Text style={{ fontSize: 14, color: "#ea580c", fontWeight: "600", marginTop: 4 }}>{couponResult.discount}% de descuento</Text>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Válido 7 días. Úsalo al pagar en marketplace.</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 40 }}>🏆</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Ya tienes cupón de hoy</Text>
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316", letterSpacing: 2 }}>{(couponResult as any).existingCode}</Text>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Solo 1 cupón por día.</Text>
              </>
            )}
            <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 4 }}>
              <Pressable onPress={startNew} style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                <RotateCcw size={14} color="#374151" />
                <Text style={{ fontWeight: "600", color: "#374151" }}>Otra vez</Text>
              </Pressable>
              <Pressable onPress={() => { setCouponResult(null); router.push("/(owner)/(tabs)/marketplace"); }} style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#f97316", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", color: "#fff" }}>Usar cupón</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

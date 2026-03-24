import { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Trophy, Gift, X, RotateCcw } from "lucide-react-native";

const { width: SW } = Dimensions.get("window");
const GW  = Math.min(SW - 24, 420);
const GH  = 190;
const GY  = 148;   // ground Y from top
const DOG_X  = 62;
const DOG_W  = 32;
const DOG_H  = 32;
const GRAVITY   = 1600;
const JUMP_VEL  = -560;
const DBL_VEL   = -500;
const INIT_SPD  = 220;
const MAX_SPD   = 700;
const SPD_INC   = 12;
const SPF       = 10;
const MILESTONES = [100, 250, 500, 1000, 2500];
const TICK_MS   = 16;

const OBS_TYPES = [
  { emoji: "🐱", w: 30, h: 44 },
  { emoji: "💉", w: 20, h: 44 },
  { emoji: "🧴", w: 26, h: 44 },
];

interface Obs { id: number; x: number; emoji: string; w: number; h: number; }

// All game physics — mutated directly each tick, no re-render overhead
interface Physics {
  dogY: number; dogVY: number; jumpsLeft: number;
  obs: Obs[]; speed: number; score: number; animT: number;
  spawnT: number; nextSpawn: number; lastId: number;
  milestoneMsg: string; milestoneT: number;
}

function freshPhysics(): Physics {
  return {
    dogY: GY - DOG_H, dogVY: 0, jumpsLeft: 2,
    obs: [], speed: INIT_SPD, score: 0, animT: 0,
    spawnT: 0, nextSpawn: 1200, lastId: 0,
    milestoneMsg: "", milestoneT: 0,
  };
}

function nextSpawnMs(speed: number) {
  const t = (speed - INIT_SPD) / (MAX_SPD - INIT_SPD);
  return 1400 - 600 * Math.min(1, t) + (Math.random() - 0.5) * 300;
}

type Phase = "start" | "playing" | "dead";

type CouponResult =
  | { type: "coupon"; code: string; discount: number }
  | { type: "alreadyEarned"; existingCode: string }
  | { type: "none" }
  | null;

export default function GameScreen() {
  const queryClient = useQueryClient();

  // React state — only what needs to trigger a re-render
  const [phase, setPhase]         = useState<Phase>("start");
  const [score, setScore]         = useState(0);
  const [dogY, setDogY]           = useState(GY - DOG_H);
  const [obs, setObs]             = useState<Obs[]>([]);
  const [milestoneMsg, setMilestoneMsg] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult>(null);
  const [finalScore, setFinalScore]     = useState(0);

  // Mutable physics (no re-render)
  const p    = useRef<Physics>(freshPhysics());
  const phaseRef = useRef<Phase>("start");
  const milestonesHit = useRef(new Set<number>());
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutatRef      = useRef<(s: number) => void>(() => {});

  const { data: gameData } = useQuery({
    queryKey: ["game-data"],
    queryFn: () => api.get("/mobile/game").then(r => r.data),
  });

  const scoreMutation = useMutation({
    mutationFn: (s: number) => api.post("/mobile/game", { score: s }).then(r => r.data),
    onSuccess: (data: any, s: number) => {
      setFinalScore(s);
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

  mutatRef.current = scoreMutation.mutate;

  // ── TICK ──────────────────────────────────────────────────────────────────
  function tick() {
    if (phaseRef.current !== "playing") return;
    const dt = TICK_MS / 1000;
    const g  = p.current;

    g.animT  += dt;
    g.speed   = Math.min(MAX_SPD, g.speed + SPD_INC * dt);
    g.score  += SPF * dt;

    // Dog physics
    g.dogVY  += GRAVITY * dt;
    g.dogY   += g.dogVY * dt;
    if (g.dogY >= GY - DOG_H) {
      g.dogY    = GY - DOG_H;
      g.dogVY   = 0;
      g.jumpsLeft = 2;
    }

    // Spawn obstacle
    g.spawnT += TICK_MS;
    if (g.spawnT >= g.nextSpawn) {
      g.spawnT   = 0;
      g.nextSpawn = nextSpawnMs(g.speed);
      const ot   = OBS_TYPES[g.score < 300 ? 0 : Math.floor(Math.random() * OBS_TYPES.length)];
      g.obs.push({ id: ++g.lastId, x: GW + 20, emoji: ot.emoji, w: ot.w, h: ot.h });
    }

    // Move + despawn
    g.obs = g.obs.filter(o => { o.x -= g.speed * dt; return o.x + o.w > -20; });

    // Collision
    const dL = DOG_X + 5, dR = DOG_X + DOG_W - 5;
    const dT = g.dogY + 5, dB = g.dogY + DOG_H - 2;
    for (const o of g.obs) {
      if (dR > o.x + 4 && dL < o.x + o.w - 4 && dB > GY - o.h + 6 && dT < GY) {
        phaseRef.current = "dead";
        setPhase("dead");
        mutatRef.current(Math.floor(g.score));
        return;
      }
    }

    // Milestones
    for (const m of MILESTONES) {
      if (g.score >= m && !milestonesHit.current.has(m)) {
        milestonesHit.current.add(m);
        g.milestoneMsg = `¡${m}!`;
        g.milestoneT   = 1.5;
        setMilestoneMsg(`¡${m}!`);
        setTimeout(() => setMilestoneMsg(""), 1500);
      }
    }

    // Push state to React (batched every frame)
    setDogY(g.dogY);
    setScore(Math.floor(g.score));
    setObs([...g.obs]);
  }

  // ── INTERVAL ──────────────────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(tick, TICK_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // ── INPUT ─────────────────────────────────────────────────────────────────
  function handlePressIn() {
    if (phaseRef.current === "start" || phaseRef.current === "dead") {
      // Start / restart
      p.current = freshPhysics();
      milestonesHit.current.clear();
      setCouponResult(null);
      setFinalScore(0);
      setScore(0);
      setDogY(GY - DOG_H);
      setObs([]);
      setMilestoneMsg("");
      phaseRef.current = "playing";
      setPhase("playing");
    } else if (phaseRef.current === "playing") {
      const g = p.current;
      if (g.jumpsLeft > 0) {
        g.dogVY = g.jumpsLeft === 2 ? JUMP_VEL : DBL_VEL;
        g.jumpsLeft -= 1;
      }
    }
  }

  const topScore  = (gameData as any)?.topScore ?? 0;
  const coupons: any[] = (gameData as any)?.coupons ?? [];
  const bounceY   = phase === "playing" && dogY >= GY - DOG_H - 1
    ? Math.sin(Date.now() / 80) * 2 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#00c8b4" }}>🎮 Perro Corredor</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={20} color="#9ca3af" />
        </Pressable>
      </View>

      {/* ── GAME AREA ── */}
      <Pressable onPressIn={handlePressIn} style={{ marginHorizontal: 12 }}>
        <View style={{ width: GW, height: GH, backgroundColor: "#e8e4dc", borderRadius: 16, overflow: "hidden" }}>

          {/* Sky */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: GH - GY, backgroundColor: "#f0ede6" }} />

          {/* Ground */}
          <View style={{ position: "absolute", top: GY, left: 0, right: 0, height: 2, backgroundColor: "#b0aca4" }} />
          <View style={{ position: "absolute", top: GY + 2, left: 0, right: 0, bottom: 0, backgroundColor: "#c8c4bc" }} />

          {/* Score */}
          {phase !== "start" && (
            <Text style={{ position: "absolute", top: 8, right: 12, fontSize: 12, fontWeight: "700", color: "#555" }}>
              {String(score).padStart(5, "0")}
            </Text>
          )}

          {/* Milestone */}
          {milestoneMsg !== "" && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#00c8b4" }}>{milestoneMsg}</Text>
            </View>
          )}

          {/* Dog */}
          <Text style={{
            position: "absolute",
            left: DOG_X,
            top: dogY + bounceY,
            fontSize: 28,
            transform: phase === "dead" ? [{ rotate: "90deg" }] : [],
          }}>
            🐕
          </Text>

          {/* Obstacles */}
          {obs.map(o => (
            <Text key={o.id} style={{ position: "absolute", left: o.x, top: GY - o.h + 4, fontSize: 34 }}>
              {o.emoji}
            </Text>
          ))}

          {/* START */}
          {phase === "start" && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(240,237,230,0.9)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#00c8b4" }}>PERRO</Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#a0602c" }}>CORREDOR</Text>
              <Text style={{ fontSize: 13, color: "#555", marginTop: 12, fontWeight: "600" }}>TAP PARA CORRER 🐾</Text>
              <Text style={{ fontSize: 10, color: "#00c8b4", marginTop: 4 }}>200 pts = cupón de descuento</Text>
            </View>
          )}

          {/* DEAD */}
          {phase === "dead" && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,8,8,0.65)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#ff4466" }}>¡OH NO!</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#ffcc44", marginTop: 4 }}>
                {String(score).padStart(5, "0")} PTS
              </Text>
              <Text style={{ fontSize: 10, color: "#ccc", marginTop: 10 }}>TAP PARA INTENTAR OTRA VEZ</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Tiers */}
      <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 12, marginTop: 10 }}>
        {[
          { pts: "200+",  pct: "5%",  bg: "#fef3c7", c: "#d97706" },
          { pts: "500+",  pct: "10%", bg: "#ffedd5", c: "#f97316" },
          { pts: "1000+", pct: "15%", bg: "#fee2e2", c: "#dc2626" },
        ].map(({ pts, pct, bg, c }) => (
          <View key={pts} style={{ flex: 1, backgroundColor: bg, borderRadius: 10, padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: c }}>{pct}</Text>
            <Text style={{ fontSize: 11, color: c, marginTop: 2 }}>{pts} pts</Text>
            <Text style={{ fontSize: 9, color: c, marginTop: 1, opacity: 0.8 }}>máx. $5.000</Text>
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
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    Vence: {new Date(c.expiresAt).toLocaleDateString("es-CL")}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{c.discount}% OFF</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>
          Máx. 1 cupón/día · Válido 7 días · Descuento máx. $5.000 CLP · Úsalo en el marketplace
        </Text>
      </ScrollView>

      {/* Coupon overlay */}
      {couponResult && couponResult.type !== "none" && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center", padding: 24 }}>
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
                <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Válido 7 días · Descuento máx. $5.000 CLP · úsalo en el marketplace</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 40 }}>🏆</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Ya tienes cupón de hoy</Text>
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316", letterSpacing: 2 }}>{(couponResult as any).existingCode}</Text>
                </View>
              </>
            )}
            <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 4 }}>
              <Pressable
                onPress={() => { setCouponResult(null); setPhase("start"); phaseRef.current = "start"; p.current = freshPhysics(); setDogY(GY - DOG_H); setObs([]); setScore(0); }}
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              >
                <RotateCcw size={14} color="#374151" />
                <Text style={{ fontWeight: "600", color: "#374151" }}>Otra vez</Text>
              </Pressable>
              <Pressable
                onPress={() => { setCouponResult(null); router.push("/(owner)/(tabs)/marketplace"); }}
                style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#f97316", alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: "#fff" }}>Usar cupón</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

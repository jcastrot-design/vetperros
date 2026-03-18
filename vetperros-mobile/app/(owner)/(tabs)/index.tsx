import { ScrollView, View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { Bell, Search, ChevronRight } from "lucide-react-native";

const SPECIES_EMOJI: Record<string, string> = {
  DOG: "🐶", CAT: "🐱", BIRD: "🐦", RABBIT: "🐰", DEFAULT: "🐾",
};

const TYPE_EMOJI: Record<string, string> = {
  WALK: "🦮", GROOMING: "✂️", VET_HOME: "🏥",
  DAYCARE: "🏠", SITTING: "🤝", BOARDING: "🛏️",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada", IN_PROGRESS: "En curso",
  COMPLETED: "Completada", CANCELLED: "Cancelada",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  PENDING:     { bg: "#fef3c7", text: "#d97706" },
  CONFIRMED:   { bg: "#dcfce7", text: "#16a34a" },
  IN_PROGRESS: { bg: "#ede9fe", text: "#7c3aed" },
  COMPLETED:   { bg: "#f3f4f6", text: "#6b7280" },
  CANCELLED:   { bg: "#fee2e2", text: "#dc2626" },
};

export default function DashboardScreen() {
  const { session } = useAuthStore();

  const { data: petsData, isLoading: loadingPets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then(r => r.data.data),
    retry: 0,
  });

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "all"],
    queryFn: () => api.get("/mobile/bookings").then(r => r.data.data),
    retry: 0,
  });

  const { data: remindersData } = useQuery({
    queryKey: ["reminders"],
    queryFn: () =>
      api.get("/mobile/reminders").then(r => r.data.data).catch(() => []),
  });

  const pets      = petsData    ?? [];
  const bookings  = bookingsData ?? [];
  const reminders = remindersData ?? [];

  const active    = bookings.filter((b: any) => ["CONFIRMED", "IN_PROGRESS"].includes(b.status));
  const inProgress = active.filter((b: any) => b.status === "IN_PROGRESS");
  const confirmed  = active.filter((b: any) => b.status === "CONFIRMED").slice(0, 3);
  const recent     = bookings.slice(0, 5);

  const isLoading = loadingPets || loadingBookings;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#f97316" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>Bienvenido 👋</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>{session?.name}</Text>
          </View>
          <Link href="/(owner)/notifications" asChild>
            <Pressable style={{ width: 40, height: 40, backgroundColor: "#fff", borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb" }}>
              <Bell size={20} color="#6b7280" />
            </Pressable>
          </Link>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flex: 1, backgroundColor: "#fff7ed", borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>🐾</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 4 }}>{pets.length}</Text>
            <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "500" }}>Mascotas</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#eff6ff", borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>📅</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 4 }}>{bookings.length}</Text>
            <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "500" }}>Reservas</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(owner)/(tabs)/services")}
            style={{ flex: 1, backgroundColor: "#f97316", borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14 }}
          >
            <Search size={20} color="#fff" />
            <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700", marginTop: 4 }}>Buscar</Text>
          </Pressable>
        </View>

        {/* Servicio en curso */}
        {inProgress.map((b: any) => (
          <Pressable
            key={b.id}
            onPress={() => router.push(`/(owner)/bookings/${b.id}`)}
            style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: "#ede9fe", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#c4b5fd" }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <View style={{ backgroundColor: "#7c3aed", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>● Servicio en curso</Text>
              </View>
              <ChevronRight size={16} color="#7c3aed" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{b.service?.title}</Text>
            <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>con {b.service?.provider?.name}</Text>
          </Pressable>
        ))}

        {/* Próximas reservas confirmadas */}
        {confirmed.length > 0 && (
          <SectionHeader title="📅 Próximas reservas" onMore={() => router.push("/(owner)/bookings")} />
        )}
        {confirmed.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20, gap: 8 }}>
            {confirmed.map((b: any) => (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/(owner)/bookings/${b.id}`)}
                style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10, borderLeftWidth: 3, borderLeftColor: "#3b82f6", borderWidth: 1, borderColor: "#f3f4f6" }}
              >
                <Text style={{ fontSize: 24 }}>{TYPE_EMOJI[b.service?.type] ?? "🐾"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{b.service?.title}</Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {b.service?.provider?.name} · {new Date(b.startDate).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>Confirmada</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Recordatorios */}
        {reminders.length > 0 && (
          <>
            <SectionHeader title="⏰ Recordatorios pendientes" />
            <View style={{ paddingHorizontal: 16, marginBottom: 20, gap: 8 }}>
              {reminders.map((r: any) => {
                const overdue = new Date(r.dueDate) < new Date();
                return (
                  <View
                    key={r.id}
                    style={{ backgroundColor: "#fff", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: overdue ? "#fecaca" : "#f3f4f6" }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{r.title}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>🐾 {r.pet?.name}</Text>
                    </View>
                    <View style={{ backgroundColor: overdue ? "#fee2e2" : "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: overdue ? "#dc2626" : "#d97706" }}>
                        {overdue ? "Vencido" : new Date(r.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Mis mascotas */}
        {pets.length > 0 ? (
          <>
            <SectionHeader title="🐾 Mis mascotas" onMore={() => router.push("/(owner)/(tabs)/pets")} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
            >
              {pets.map((pet: any) => (
                <Pressable
                  key={pet.id}
                  onPress={() => router.push(`/(owner)/pets/${pet.id}`)}
                  style={{ alignItems: "center", width: 72 }}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff7ed", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fed7aa" }}>
                    {pet.avatarUrl ? (
                      <Image source={{ uri: pet.avatarUrl }} contentFit="cover" style={{ width: 64, height: 64 }} />
                    ) : (
                      <Text style={{ fontSize: 28 }}>{SPECIES_EMOJI[pet.species?.toUpperCase()] ?? "🐾"}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: "#374151", fontWeight: "600", marginTop: 6, textAlign: "center" }} numberOfLines={1}>{pet.name}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => router.push("/(owner)/new-pet")}
                style={{ alignItems: "center", width: 72 }}
              >
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f97316", borderStyle: "dashed" }}>
                  <Text style={{ fontSize: 24, color: "#f97316" }}>+</Text>
                </View>
                <Text style={{ fontSize: 12, color: "#f97316", fontWeight: "600", marginTop: 6 }}>Agregar</Text>
              </Pressable>
            </ScrollView>
          </>
        ) : (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <SectionHeader title="🐾 Mis mascotas" />
            <Pressable
              onPress={() => router.push("/(owner)/new-pet")}
              style={{ backgroundColor: "#fff7ed", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#fed7aa", borderStyle: "dashed" }}
            >
              <Text style={{ fontSize: 36 }}>🐾</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 8 }}>Agrega tu primera mascota</Text>
              <Text style={{ fontSize: 12, color: "#f97316", fontWeight: "600", marginTop: 4 }}>+ Agregar mascota</Text>
            </Pressable>
          </View>
        )}

        {/* Acciones rápidas */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Acciones rápidas</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => router.push("/(owner)/new-pet")}
              style={{ flex: 1, backgroundColor: "#fff7ed", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}
            >
              <Text style={{ fontSize: 28 }}>🐾</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Agregar mascota</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(owner)/(tabs)/services")}
              style={{ flex: 1, backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe" }}
            >
              <Text style={{ fontSize: 28 }}>🔍</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Buscar servicio</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(owner)/bookings")}
              style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#bbf7d0" }}
            >
              <Text style={{ fontSize: 28 }}>📅</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Mis reservas</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Pressable
              onPress={() => router.push("/(owner)/insurance/plans")}
              style={{ flex: 1, backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe" }}
            >
              <Text style={{ fontSize: 28 }}>🛡️</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Seguros</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(owner)/insurance/my-policies")}
              style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#bbf7d0" }}
            >
              <Text style={{ fontSize: 28 }}>📋</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Mis pólizas</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(owner)/reminders")}
              style={{ flex: 1, backgroundColor: "#fff7ed", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}
            >
              <Text style={{ fontSize: 28 }}>⏰</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151", marginTop: 6, textAlign: "center" }}>Recordatorios</Text>
            </Pressable>
          </View>
        </View>

        {/* Historial reciente */}
        {recent.length > 0 && (
          <>
            <SectionHeader title="🕐 Historial de reservas" onMore={() => router.push("/(owner)/bookings")} />
            <View style={{ paddingHorizontal: 16, marginBottom: 24, gap: 8 }}>
              {recent.map((b: any) => {
                const colors = STATUS_COLOR[b.status] ?? STATUS_COLOR.PENDING;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => router.push(`/(owner)/bookings/${b.id}`)}
                    style={{ backgroundColor: "#fff", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#f3f4f6" }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{b.service?.title}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{b.service?.provider?.name}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>{STATUS_LABEL[b.status]}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{title}</Text>
      {onMore && (
        <Pressable onPress={onMore}>
          <Text style={{ fontSize: 13, color: "#f97316", fontWeight: "600" }}>Ver todos</Text>
        </Pressable>
      )}
    </View>
  );
}

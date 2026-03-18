import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  PENDING:     { bg: "#fef3c7", text: "#d97706" },
  CONFIRMED:   { bg: "#dcfce7", text: "#16a34a" },
  IN_PROGRESS: { bg: "#dbeafe", text: "#2563eb" },
  COMPLETED:   { bg: "#f3f4f6", text: "#6b7280" },
  CANCELLED:   { bg: "#fee2e2", text: "#dc2626" },
};

const TYPE_EMOJI: Record<string, string> = {
  WALK: "🦮", GROOMING: "✂️", VET_HOME: "🏥",
  DAYCARE: "🏠", SITTING: "🤝", BOARDING: "🛏️",
};

const FILTERS = [
  { key: null, label: "Todas" },
  { key: "CONFIRMED", label: "Confirmadas" },
  { key: "PENDING", label: "Pendientes" },
  { key: "COMPLETED", label: "Completadas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export default function BookingsScreen() {
  const [filter, setFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: () => {
      const params = filter ? `?status=${filter}` : "";
      return api.get(`/mobile/bookings${params}`).then(r => r.data.data);
    },
  });

  const bookings = data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={String(f.key)}
            onPress={() => setFilter(f.key)}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: filter === f.key ? "#f97316" : "#fff",
              borderWidth: 1, borderColor: filter === f.key ? "#f97316" : "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: filter === f.key ? "#fff" : "#6b7280" }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 48 }}>📅</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16 }}>Sin reservas</Text>
          <Text style={{ color: "#6b7280", marginTop: 8, textAlign: "center" }}>No tienes reservas en esta categoría</Text>
          <Pressable
            onPress={() => router.push("/(owner)/(tabs)/services")}
            style={{ marginTop: 20, backgroundColor: "#f97316", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Buscar servicios</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
          {bookings.map((b: any) => {
            const colors = STATUS_COLOR[b.status] ?? STATUS_COLOR.PENDING;
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/(owner)/bookings/${b.id}`)}
                style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 24 }}>{TYPE_EMOJI[b.service?.type] ?? "🐾"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{b.service?.title}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      🐶 {b.pet?.name} · {b.service?.provider?.name}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>{STATUS_LABEL[b.status]}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    📅 {new Date(b.startDate).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#f97316" }}>
                    ${Number(b.totalPrice).toLocaleString("es-CL")}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

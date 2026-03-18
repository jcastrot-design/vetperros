import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const TYPE_ICON: Record<string, string> = {
  BOOKING_CONFIRMED: "✅",
  BOOKING_CANCELLED: "❌",
  BOOKING_REMINDER:  "⏰",
  MESSAGE:           "💬",
  PET_REMINDER:      "🐾",
  SYSTEM:            "📢",
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/mobile/notifications").then(r => r.data.data),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch("/mobile/notifications"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data ?? [];
  const unread = notifications.filter((n: any) => !n.readAt).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {unread > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <Text style={{ fontSize: 13, color: "#f97316", fontWeight: "600" }}>Marcar todo como leído</Text>
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 48 }}>🔔</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16 }}>Sin notificaciones</Text>
          <Text style={{ color: "#6b7280", marginTop: 8 }}>Te avisaremos cuando haya novedades</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((n: any) => (
            <View
              key={n.id}
              style={{
                flexDirection: "row", alignItems: "flex-start", gap: 12,
                padding: 16, backgroundColor: n.readAt ? "#fff" : "#fff7ed",
                borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 20 }}>{TYPE_ICON[n.type] ?? "📢"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: n.readAt ? "400" : "700", color: "#111827" }}>{n.title}</Text>
                {n.body && <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{n.body}</Text>}
                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              {!n.readAt && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#f97316", marginTop: 4 }} />
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

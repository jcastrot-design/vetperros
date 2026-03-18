import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { api } from "@/lib/api/client";

const ROLE_EMOJI: Record<string, string> = {
  WALKER: "🦮", VET: "🏥", GROOMER: "✂️", CLINIC: "🏥",
  OWNER: "👤", ADMIN: "⚙️",
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function Chat() {
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get("/mobile/conversations").then((r) => r.data.data),
    refetchInterval: 15000, // poll every 15 seconds
  });

  const filtered = conversations.filter((conv) =>
    conv.participants.some((p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Mensajes</Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e5e7eb" }}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar conversación..."
            style={{ flex: 1, paddingVertical: 10, paddingLeft: 8, fontSize: 14, color: "#111827" }}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Text style={{ fontSize: 40 }}>💬</Text>
          <Text style={{ color: "#6b7280", fontSize: 15 }}>
            {search ? "Sin resultados" : "No tienes conversaciones aún"}
          </Text>
          {!search && (
            <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", paddingHorizontal: 40 }}>
              Las conversaciones aparecen cuando reservas un servicio
            </Text>
          )}
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {filtered.map((conv) => {
            const other = conv.participants[0];
            const emoji = ROLE_EMOJI[other?.role] ?? "👤";
            const lastName = conv.lastMessage?.content ?? "Sin mensajes";
            const lastTime = conv.lastMessage?.createdAt ? formatTime(conv.lastMessage.createdAt) : "";
            return (
              <Pressable
                key={conv.id}
                onPress={() =>
                  router.push(
                    `/(owner)/chat-room?id=${conv.id}&name=${encodeURIComponent(other?.name ?? "Chat")}&emoji=${encodeURIComponent(emoji)}`
                  )
                }
                style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 12 }}
              >
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{other?.name ?? "Usuario"}</Text>
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>{lastTime}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>{other?.role ?? ""}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, color: "#6b7280", flex: 1 }} numberOfLines={1}>{lastName}</Text>
                    {conv.unreadCount > 0 && (
                      <View style={{ backgroundColor: "#f97316", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

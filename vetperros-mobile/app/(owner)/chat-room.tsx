import { useRef, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react-native";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function ChatRoomScreen() {
  const { id, name, emoji } = useLocalSearchParams<{ id: string; name: string; emoji: string }>();
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);

  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ["messages", id],
    queryFn: () => api.get(`/mobile/conversations/${id}`).then((r) => r.data.data),
    enabled: !!id,
    refetchInterval: 5000, // poll every 5 seconds for new messages
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/mobile/conversations/${id}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setInput("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  function sendMessage() {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  }

  const decodedName = decodeURIComponent(name ?? "Chat");
  const decodedEmoji = decodeURIComponent(emoji ?? "🐾");

  return (
    <>
      <Stack.Screen options={{ title: decodedName, headerBackTitle: "Mensajes" }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["bottom"]}>

          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#f97316" size="large" />
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {messages.length === 0 && (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ fontSize: 40 }}>👋</Text>
                  <Text style={{ color: "#6b7280", marginTop: 8 }}>Sé el primero en escribir</Text>
                </View>
              )}
              {messages.map((msg) => {
                const fromMe = msg.senderId === session?.id;
                return (
                  <View key={msg.id} style={{ alignItems: fromMe ? "flex-end" : "flex-start" }}>
                    {!fromMe && (
                      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, maxWidth: "80%" }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontSize: 16 }}>{decodedEmoji}</Text>
                        </View>
                        <View style={{ backgroundColor: "#fff", borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: "#f3f4f6", maxWidth: "100%" }}>
                          <Text style={{ fontSize: 14, color: "#111827" }}>{msg.content}</Text>
                          <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{formatTime(msg.createdAt)}</Text>
                        </View>
                      </View>
                    )}
                    {fromMe && (
                      <View style={{ backgroundColor: "#f97316", borderRadius: 16, borderBottomRightRadius: 4, padding: 12, maxWidth: "80%" }}>
                        <Text style={{ fontSize: 14, color: "#fff" }}>{msg.content}</Text>
                        <Text style={{ fontSize: 11, color: "#fff9", marginTop: 4, textAlign: "right" }}>{formatTime(msg.createdAt)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Input */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb" }}
              placeholderTextColor="#9ca3af"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!sendMutation.isPending}
            />
            <Pressable
              onPress={sendMessage}
              disabled={sendMutation.isPending || !input.trim()}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: input.trim() ? "#f97316" : "#e5e7eb", alignItems: "center", justifyContent: "center" }}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Send size={18} color={input.trim() ? "#fff" : "#9ca3af"} />
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

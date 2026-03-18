import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/stores/auth-store";
import { Platform, View } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="(provider)" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </QueryClientProvider>
  );

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" }}>
        <View style={{
          width: 390,
          height: 844,
          overflow: "hidden",
          borderRadius: 40,
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          border: "8px solid #1f2937",
          position: "relative",
        } as any}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

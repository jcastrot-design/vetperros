import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { session, loading } = useAuthStore();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/signin" />;

  if (session.role === "OWNER") return <Redirect href="/(owner)" />;
  if (session.role === "WALKER" || session.role === "VET") return <Redirect href="/(provider)" />;

  return <Redirect href="/(auth)/signin" />;
}

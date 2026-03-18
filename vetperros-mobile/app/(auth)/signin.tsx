import { useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import Toast from "react-native-toast-message";

export default function SignInScreen() {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Completa todos los campos" });
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.error) {
        Toast.show({ type: "error", text1: result.error });
        return;
      }
      // Navigation handled by auth store based on role
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-3xl bg-orange-500 items-center justify-center mb-4">
              <Text className="text-4xl">🐾</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">VetPerros</Text>
            <Text className="text-gray-500 mt-1">Tu plataforma veterinaria</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Contraseña</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              className="bg-orange-500 rounded-xl py-4 items-center active:bg-orange-600 mt-2"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Iniciar sesión</Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">¿No tienes cuenta? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-orange-500 font-semibold">Regístrate</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import Toast from "react-native-toast-message";

const ROLES = [
  { key: "OWNER", label: "Dueño de mascota", emoji: "🐾" },
  { key: "WALKER", label: "Paseador", emoji: "🦮" },
  { key: "VET", label: "Veterinario", emoji: "🏥" },
];

export default function SignUpScreen() {
  const { signIn } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OWNER");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Completa todos los campos" });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: "error", text1: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/mobile/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (res.data?.error) {
        Toast.show({ type: "error", text1: res.data.error });
        return;
      }

      // Auto-login after registration
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.error) {
        Toast.show({ type: "error", text1: result.error });
        return;
      }
      router.replace("/");
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Error al registrar";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 36 }}>🐾</Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827" }}>Crear cuenta</Text>
            <Text style={{ color: "#6b7280", marginTop: 4 }}>Únete a VetPerros</Text>
          </View>

          {/* Role selector */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 }}>Soy...</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {ROLES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRole(r.key)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                  backgroundColor: role === r.key ? "#fff7ed" : "#f9fafb",
                  borderWidth: 1, borderColor: role === r.key ? "#f97316" : "#e5e7eb",
                }}
              >
                <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
                <Text style={{ fontSize: 11, fontWeight: "600", color: role === r.key ? "#f97316" : "#374151", marginTop: 4, textAlign: "center" }}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Fields */}
          <View style={{ gap: 14, marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Nombre completo</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                autoCapitalize="words"
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb" }}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb" }}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Contraseña</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                autoComplete="new-password"
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb" }}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSignUp}
            disabled={loading}
            style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Crear cuenta</Text>
            )}
          </Pressable>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ color: "#6b7280" }}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/signin" asChild>
              <Pressable>
                <Text style={{ color: "#f97316", fontWeight: "600" }}>Inicia sesión</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["profile"],
    queryFn: () => api.get("/mobile/users/me").then((r) => r.data.data),
  });

  useEffect(() => {
    if (user && !initialized) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setInitialized(true);
    }
  }, [user, initialized]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch("/mobile/users/me", data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Toast.show({ type: "success", text1: "Perfil actualizado" });
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al actualizar" });
    },
  });

  function handleSave() {
    if (!name.trim()) { Toast.show({ type: "error", text1: "El nombre no puede estar vacío" }); return; }
    updateMutation.mutate({ name: name.trim(), phone: phone.trim() || undefined });
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#f97316" }}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 12 }}>{user?.name}</Text>
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{user?.email}</Text>
          <View style={{ backgroundColor: "#fff7ed", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: "#f97316", fontWeight: "700" }}>{user?.role ?? "OWNER"}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{user?._count?.pets ?? 0}</Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Mascotas</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{user?._count?.bookingsAsClient ?? 0}</Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Reservas</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>
              {user?.createdAt ? `Miembro desde\n${new Date(user.createdAt).toLocaleDateString("es-CL", { month: "short", year: "numeric" })}` : "—"}
            </Text>
          </View>
        </View>

        {/* Edit form */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Editar perfil</Text>

          <View>
            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb" }}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Teléfono</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+56 9 1234 5678"
              keyboardType="phone-pad"
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb" }}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Email</Text>
            <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>{user?.email}</Text>
            </View>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>El email no se puede cambiar</Text>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={updateMutation.isPending}
            style={{ backgroundColor: "#f97316", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 }}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Guardar cambios</Text>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const SPECIES_EMOJI: Record<string, string> = {
  DOG: "🐶", CAT: "🐱", BIRD: "🐦", RABBIT: "🐰", DEFAULT: "🐾",
};

const SPECIES_LABEL: Record<string, string> = {
  DOG: "Perro", CAT: "Gato", BIRD: "Pájaro", RABBIT: "Conejo",
};

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pet", id],
    queryFn: () => api.get(`/mobile/pets/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/mobile/pets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      Toast.show({ type: "success", text1: "Mascota eliminada" });
      router.back();
    },
    onError: () => {
      Toast.show({ type: "error", text1: "No se pudo eliminar la mascota" });
    },
  });

  function confirmDelete() {
    Alert.alert(
      "Eliminar mascota",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#6b7280" }}>Mascota no encontrada</Text>
      </View>
    );
  }

  const pet = data;
  const emoji = SPECIES_EMOJI[pet.species?.toUpperCase()] ?? SPECIES_EMOJI.DEFAULT;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#fff7ed", overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            {pet.avatarUrl ? (
              <Image source={{ uri: pet.avatarUrl }} contentFit="cover" style={{ width: 96, height: 96 }} />
            ) : (
              <Text style={{ fontSize: 48 }}>{emoji}</Text>
            )}
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{pet.name}</Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {SPECIES_LABEL[pet.species?.toUpperCase()] ?? pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
          </Text>
          <Pressable
            onPress={() => router.push(`/(owner)/edit-pet?id=${pet.id}`)}
            style={{ marginTop: 14, backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Editar mascota</Text>
          </Pressable>
        </View>

        {/* Basic info */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Información</Text>
          {pet.age && <InfoRow label="🎂 Edad" value={`${pet.age} años`} />}
          {pet.weight && <InfoRow label="⚖️ Peso" value={`${pet.weight} kg`} />}
          {pet.sex && <InfoRow label="🔵 Sexo" value={pet.sex === "MALE" ? "Macho" : "Hembra"} />}
          {pet.color && <InfoRow label="🎨 Color" value={pet.color} />}
          {pet.microchipId && <InfoRow label="💾 Microchip" value={pet.microchipId} />}
        </View>

        {/* Vaccines */}
        {pet.vaccines?.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>💉 Vacunas</Text>
            <View style={{ gap: 8 }}>
              {pet.vaccines.map((v: any) => (
                <View key={v.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: "#111827" }}>{v.name}</Text>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    {new Date(v.dateAdministered).toLocaleDateString("es-CL")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Medications */}
        {pet.medications?.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>💊 Medicamentos</Text>
            <View style={{ gap: 8 }}>
              {pet.medications.map((m: any) => (
                <View key={m.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: "#111827" }}>{m.name}</Text>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>{m.dosage}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Medical visits */}
        {pet.medicalVisits?.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>🩺 Visitas médicas</Text>
            <View style={{ gap: 10 }}>
              {pet.medicalVisits.slice(0, 5).map((v: any) => (
                <View key={v.id} style={{ borderLeftWidth: 3, borderLeftColor: "#f97316", paddingLeft: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{v.title}</Text>
                  <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {new Date(v.visitDate).toLocaleDateString("es-CL")} · {v.veterinarian ?? "Veterinario"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reminders */}
        {pet.reminders?.length > 0 && (
          <View style={{ backgroundColor: "#fff7ed", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fed7aa" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#92400e", marginBottom: 12 }}>⏰ Recordatorios pendientes</Text>
            <View style={{ gap: 8 }}>
              {pet.reminders.map((r: any) => (
                <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: "#92400e" }}>{r.title}</Text>
                  <Text style={{ fontSize: 13, color: "#d97706" }}>
                    {new Date(r.dueDate).toLocaleDateString("es-CL")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Documents */}
        {pet.documents?.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>📄 Documentos</Text>
            <View style={{ gap: 8 }}>
              {pet.documents.map((d: any) => (
                <View key={d.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: "#111827", flex: 1 }} numberOfLines={1}>{d.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>
                    {new Date(d.uploadedAt).toLocaleDateString("es-CL")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delete */}
        <Pressable
          onPress={confirmDelete}
          disabled={deleteMutation.isPending}
          style={{ backgroundColor: "#fee2e2", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 8 }}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text style={{ color: "#dc2626", fontWeight: "700", fontSize: 15 }}>Eliminar mascota</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 13, color: "#6b7280" }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#111827", fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

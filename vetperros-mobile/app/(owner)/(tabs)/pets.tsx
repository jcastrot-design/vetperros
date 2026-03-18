import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Plus } from "lucide-react-native";

const SPECIES_EMOJI: Record<string, string> = {
  DOG: "🐶", CAT: "🐱", BIRD: "🐦", RABBIT: "🐰", DEFAULT: "🐾",
};

export default function Pets() {
  const { data, isLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then(r => r.data.data),
  });

  const pets = data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Mis Mascotas</Text>
        <Pressable
          onPress={() => router.push("/(owner)/new-pet")}
          style={{ backgroundColor: "#f97316", borderRadius: 10, padding: 8 }}
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#f97316" />
        </View>
      ) : pets.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 56 }}>🐾</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 16 }}>Sin mascotas aún</Text>
          <Text style={{ color: "#6b7280", marginTop: 8, textAlign: "center" }}>Agrega tu primera mascota para comenzar</Text>
          <Pressable
            onPress={() => router.push("/(owner)/new-pet")}
            style={{ marginTop: 20, backgroundColor: "#f97316", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>+ Agregar mascota</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {pets.map((pet: any) => (
            <Pressable
              key={pet.id}
              onPress={() => router.push(`/(owner)/pets/${pet.id}`)}
              style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#f3f4f6" }}
            >
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff7ed", overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
                {pet.avatarUrl ? (
                  <Image source={{ uri: pet.avatarUrl }} contentFit="cover" style={{ width: 64, height: 64 }} />
                ) : (
                  <Text style={{ fontSize: 28 }}>{SPECIES_EMOJI[pet.species?.toUpperCase()] ?? SPECIES_EMOJI.DEFAULT}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{pet.name}</Text>
                <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{pet.breed ?? pet.species}</Text>
                {pet.weight && <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>⚖️ {pet.weight} kg</Text>}
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                {pet.vaccines?.length > 0 && (
                  <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "600" }}>💉 Vacunado</Text>
                  </View>
                )}
                {pet.medications?.length > 0 && (
                  <View style={{ backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: "#d97706", fontWeight: "600" }}>💊 Medicación</Text>
                  </View>
                )}
                <Text style={{ fontSize: 18, color: "#d1d5db" }}>›</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

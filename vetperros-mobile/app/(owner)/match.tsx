import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const SPECIES_EMOJI: Record<string, string> = {
  DOG: "🐶",
  CAT: "🐱",
  BIRD: "🐦",
  RABBIT: "🐰",
  DEFAULT: "🐾",
};

const ENERGY_LABEL: Record<string, string> = {
  LOW: "Tranquilo",
  MEDIUM: "Moderado",
  HIGH: "Muy activo",
};

export default function Match() {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [matchPet, setMatchPet] = useState<any>(null);

  // Load user's pets
  const {
    data: pets = [],
    isLoading: petsLoading,
  } = useQuery<any[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then((r) => r.data.data),
  });

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  // Load swipe feed for selected pet
  const {
    data: feed = [],
    isLoading: feedLoading,
    refetch: refetchFeed,
    isRefetching,
    error: feedError,
  } = useQuery<any[]>({
    queryKey: ["match-feed", selectedPetId],
    queryFn: () =>
      api
        .get(`/mobile/match?petId=${selectedPetId}`)
        .then((r) => { setCardIndex(0); return r.data.data; }),
    enabled: !!selectedPetId,
    retry: false,
  });

  const swipeMutation = useMutation({
    mutationFn: (vars: { targetPetId: string; action: "LIKE" | "PASS" }) =>
      api
        .post("/mobile/match", {
          petId: selectedPetId,
          targetPetId: vars.targetPetId,
          action: vars.action,
        })
        .then((r) => r.data.data),
    onSuccess: (data, vars) => {
      if (data.isMatch) {
        setMatchPet(feed[cardIndex]);
      }
      setCardIndex((i) => i + 1);
    },
  });

  const handleSwipe = (action: "LIKE" | "PASS") => {
    const current = feed[cardIndex];
    if (!current || swipeMutation.isPending) return;
    swipeMutation.mutate({ targetPetId: current.id, action });
  };

  const handleSelectPet = (id: string) => {
    setSelectedPetId(id);
    setCardIndex(0);
    setMatchPet(null);
  };

  const handleDismissMatch = () => {
    setMatchPet(null);
  };

  const handleGoToChat = () => {
    setMatchPet(null);
    router.push("/(owner)/(tabs)/chat");
  };

  // Loading pets
  if (petsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#f97316" size="large" />
      </SafeAreaView>
    );
  }

  // No pets → empty state
  if (pets.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 64 }}>🐾</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", marginTop: 16, textAlign: "center" }}>
            Necesitas una mascota
          </Text>
          <Text style={{ color: "#6b7280", marginTop: 8, textAlign: "center", fontSize: 15 }}>
            Agrega tu primera mascota para buscar compañeros de juego
          </Text>
          <Pressable
            onPress={() => router.push("/(owner)/new-pet")}
            style={{
              marginTop: 24,
              backgroundColor: "#f97316",
              borderRadius: 14,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>+ Agregar mascota</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentPet: any = feed[cardIndex];
  const feedExhausted = !feedLoading && !feedError && feed.length > 0 && cardIndex >= feed.length;
  const feedEmpty = !feedLoading && !feedError && feed.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </Pressable>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>PetMatch</Text>
          <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>Encuentra compañeros de juego 🐾</Text>
        </View>
      </View>

      {/* Pet selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 60 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
      >
        {pets.map((pet: any) => {
          const emoji = SPECIES_EMOJI[pet.species?.toUpperCase()] ?? SPECIES_EMOJI.DEFAULT;
          const selected = pet.id === selectedPetId;
          return (
            <Pressable
              key={pet.id}
              onPress={() => handleSelectPet(pet.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: selected ? "#f97316" : "#fff",
                borderWidth: 1,
                borderColor: selected ? "#f97316" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 16 }}>{emoji}</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: selected ? "#fff" : "#374151",
                }}
              >
                {pet.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Feed area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              setCardIndex(0);
              setMatchPet(null);
              refetchFeed();
            }}
            tintColor="#f97316"
          />
        }
      >
        {feedLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <ActivityIndicator color="#f97316" size="large" />
          </View>
        ) : feedError ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12, paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", textAlign: "center" }}>Error al cargar</Text>
            <Text style={{ fontSize: 12, color: "#dc2626", textAlign: "center" }}>
              {(feedError as any)?.response?.status
                ? `Error ${(feedError as any).response.status}: ${(feedError as any).response?.data?.error ?? "Error desconocido"}`
                : (feedError as any)?.message ?? "Error de red"}
            </Text>
            <Pressable onPress={() => refetchFeed()} style={{ backgroundColor: "#f97316", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Reintentar</Text>
            </Pressable>
          </View>
        ) : feedEmpty || feedExhausted ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 }}>
            <Text style={{ fontSize: 52 }}>🐾</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              No hay más mascotas por ahora
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", paddingHorizontal: 32 }}>
              Vuelve más tarde para encontrar nuevos compañeros de juego
            </Text>
            <Pressable
              onPress={() => {
                setCardIndex(0);
                refetchFeed();
              }}
              style={{
                marginTop: 8,
                backgroundColor: "#f97316",
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Actualizar</Text>
            </Pressable>
          </View>
        ) : currentPet ? (
          <View style={{ gap: 16, alignItems: "center" }}>
            {/* Counter */}
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {cardIndex + 1} / {feed.length}
            </Text>

            {/* Card */}
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 28,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
                borderWidth: 1,
                borderColor: "#f3f4f6",
                gap: 12,
              }}
            >
              {/* Species emoji */}
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: "#fff7ed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 60 }}>
                  {SPECIES_EMOJI[currentPet.species?.toUpperCase()] ?? SPECIES_EMOJI.DEFAULT}
                </Text>
              </View>

              {/* Name */}
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827" }}>
                {currentPet.name}
              </Text>

              {/* Breed / species */}
              <Text style={{ fontSize: 15, color: "#6b7280" }}>
                {currentPet.breed ?? currentPet.species}
              </Text>

              {/* Tags row */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {currentPet.owner?.city && (
                  <View
                    style={{
                      backgroundColor: "#eff6ff",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#2563eb", fontWeight: "600" }}>
                      📍 {currentPet.owner.city}
                    </Text>
                  </View>
                )}
                {currentPet.energyLevel && (
                  <View
                    style={{
                      backgroundColor: "#fef3c7",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#d97706", fontWeight: "600" }}>
                      ⚡ {ENERGY_LABEL[currentPet.energyLevel] ?? currentPet.energyLevel}
                    </Text>
                  </View>
                )}
                {currentPet.size && (
                  <View
                    style={{
                      backgroundColor: "#f0fdf4",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>
                      📏 {currentPet.size}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {currentPet.description ? (
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    textAlign: "center",
                    lineHeight: 20,
                    paddingHorizontal: 8,
                  }}
                  numberOfLines={3}
                >
                  {currentPet.description}
                </Text>
              ) : null}

              {/* Owner name */}
              {currentPet.owner?.name && (
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                  Dueño: {currentPet.owner.name}
                </Text>
              )}
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: "row", gap: 24, marginTop: 8 }}>
              {/* Pass */}
              <Pressable
                onPress={() => handleSwipe("PASS")}
                disabled={swipeMutation.isPending}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "#f3f4f6",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#e5e7eb",
                  opacity: swipeMutation.isPending ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 30 }}>❌</Text>
              </Pressable>

              {/* Like */}
              <Pressable
                onPress={() => handleSwipe("LIKE")}
                disabled={swipeMutation.isPending}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "#fff1f2",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#fda4af",
                  opacity: swipeMutation.isPending ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 30 }}>❤️</Text>
              </Pressable>
            </View>

            {swipeMutation.isPending && (
              <ActivityIndicator color="#f97316" size="small" />
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Match overlay */}
      {matchPet && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 28,
              padding: 32,
              alignItems: "center",
              width: "100%",
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 52 }}>🐾❤️</Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#f97316", textAlign: "center" }}>
              ¡Es un match!
            </Text>
            <Text style={{ fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22 }}>
              ¡A ti y a{" "}
              <Text style={{ fontWeight: "700", color: "#111827" }}>{matchPet.name}</Text>{" "}
              les gustaron mutuamente! Ya pueden chatear.
            </Text>

            {/* Match pet preview */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#fff7ed",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "#f97316",
              }}
            >
              <Text style={{ fontSize: 42 }}>
                {SPECIES_EMOJI[matchPet.species?.toUpperCase()] ?? SPECIES_EMOJI.DEFAULT}
              </Text>
            </View>

            <Pressable
              onPress={handleGoToChat}
              style={{
                width: "100%",
                backgroundColor: "#f97316",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Ver chat 💬</Text>
            </Pressable>

            <Pressable
              onPress={handleDismissMatch}
              style={{
                width: "100%",
                backgroundColor: "#f3f4f6",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#374151", fontWeight: "600", fontSize: 15 }}>Seguir jugando</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

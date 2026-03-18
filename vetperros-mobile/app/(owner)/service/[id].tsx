import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/lib/api/client";

const TYPE_EMOJI: Record<string, string> = {
  WALK: "🦮", GROOMING: "✂️", VET_HOME: "🏥",
  DAYCARE: "🏠", SITTING: "🤝", BOARDING: "🛏️",
};
const TYPE_LABEL: Record<string, string> = {
  WALK: "Paseo", GROOMING: "Grooming", VET_HOME: "Veterinaria a domicilio",
  DAYCARE: "Guardería", SITTING: "Cuidado en casa", BOARDING: "Hospedaje",
};
const DAY_LABEL: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado", SUNDAY: "Domingo",
};

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 12, color: i <= rating ? "#f59e0b" : "#d1d5db" }}>★</Text>
      ))}
    </View>
  );
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: service, isLoading } = useQuery<any>({
    queryKey: ["service", id],
    queryFn: () => api.get(`/mobile/services/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#f97316" size="large" /></View>;
  }
  if (!service) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#6b7280" }}>Servicio no encontrado</Text></View>;
  }

  const provider = service.provider;
  const reviews = provider?.reviewsReceived ?? [];
  const profile = provider?.providerProfile;
  const isVerified = profile?.verificationStatus === "VERIFIED";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <View style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 30 }}>{TYPE_EMOJI[service.type] ?? "🐾"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: "#fff7ed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: "#f97316", fontWeight: "600" }}>{TYPE_LABEL[service.type] ?? service.type}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>{service.title}</Text>
              {service.city && <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>📍 {service.city}</Text>}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316" }}>${Number(service.pricePerUnit).toLocaleString("es-CL")}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af" }}>por sesión</Text>
            </View>
          </View>

          {service.description && (
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 12 }}>{service.description}</Text>
          )}

          <Pressable
            onPress={() => router.push(`/(owner)/book-service?serviceId=${service.id}&title=${encodeURIComponent(service.title)}`)}
            style={{ backgroundColor: "#f97316", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Reservar este servicio</Text>
          </Pressable>
        </View>

        {/* Provider */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Proveedor</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{provider?.name}</Text>
                {isVerified && (
                  <View style={{ backgroundColor: "#dcfce7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: "#16a34a", fontWeight: "700" }}>✓ Verificado</Text>
                  </View>
                )}
              </View>
              {service.avgRating > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Stars rating={Math.round(service.avgRating)} />
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{service.avgRating} ({service.reviewCount} reseñas)</Text>
                </View>
              )}
            </View>
          </View>
          {provider?.bio && <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 18 }}>{provider.bio}</Text>}
          {profile && (
            <View style={{ flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {profile.experience > 0 && <Text style={{ fontSize: 12, color: "#6b7280" }}>⏱ {profile.experience} años exp.</Text>}
              {profile.totalServices > 0 && <Text style={{ fontSize: 12, color: "#6b7280" }}>✅ {profile.totalServices} servicios</Text>}
              {profile.responseTime > 0 && <Text style={{ fontSize: 12, color: "#6b7280" }}>⚡ Responde en ~{profile.responseTime} min</Text>}
            </View>
          )}
        </View>

        {/* Availability */}
        {service.availability?.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>🕐 Disponibilidad</Text>
            <View style={{ gap: 8 }}>
              {service.availability.map((slot: any) => (
                <View key={slot.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>{DAY_LABEL[slot.dayOfWeek] ?? slot.dayOfWeek}</Text>
                  <Text style={{ fontSize: 14, color: "#6b7280" }}>{slot.startTime} - {slot.endTime}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
            Reseñas ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 }}>Sin reseñas aún</Text>
          ) : (
            <View style={{ gap: 14 }}>
              {reviews.map((r: any) => (
                <View key={r.id} style={{ borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{r.author?.name}</Text>
                      <Stars rating={r.rating} />
                    </View>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(r.createdAt).toLocaleDateString("es-CL")}
                    </Text>
                  </View>
                  {(r.punctualityRating || r.careRating || r.communicationRating) && (
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      {r.punctualityRating && <Text style={{ fontSize: 11, color: "#6b7280" }}>Puntualidad: {r.punctualityRating}/5</Text>}
                      {r.careRating && <Text style={{ fontSize: 11, color: "#6b7280" }}>Cuidado: {r.careRating}/5</Text>}
                      {r.communicationRating && <Text style={{ fontSize: 11, color: "#6b7280" }}>Comunicación: {r.communicationRating}/5</Text>}
                    </View>
                  )}
                  {r.comment && <Text style={{ fontSize: 13, color: "#374151" }}>{r.comment}</Text>}
                  {r.response && (
                    <View style={{ backgroundColor: "#f9fafb", borderRadius: 8, padding: 10, marginTop: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#374151", marginBottom: 2 }}>Respuesta del proveedor:</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{r.response}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sticky book button at bottom */}
        <Pressable
          onPress={() => router.push(`/(owner)/book-service?serviceId=${service.id}&title=${encodeURIComponent(service.title)}`)}
          style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Reservar — ${Number(service.pricePerUnit).toLocaleString("es-CL")}</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

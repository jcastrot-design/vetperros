import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  PENDING:     { bg: "#fef3c7", text: "#d97706" },
  CONFIRMED:   { bg: "#dcfce7", text: "#16a34a" },
  IN_PROGRESS: { bg: "#dbeafe", text: "#2563eb" },
  COMPLETED:   { bg: "#f3f4f6", text: "#6b7280" },
  CANCELLED:   { bg: "#fee2e2", text: "#dc2626" },
};

const TYPE_EMOJI: Record<string, string> = {
  WALK: "🦮", GROOMING: "✂️", VET_HOME: "🏥",
  DAYCARE: "🏠", SITTING: "🤝", BOARDING: "🛏️",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: 28, color: i <= value ? "#f59e0b" : "#d1d5db" }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => api.get(`/mobile/bookings/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (data: any) => api.post("/mobile/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      Toast.show({ type: "success", text1: "¡Reseña enviada!", text2: "Gracias por tu opinión" });
      setShowReviewForm(false);
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al enviar reseña" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/mobile/bookings/${id}`, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      Toast.show({ type: "success", text1: "Reserva cancelada" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "No se pudo cancelar la reserva" });
    },
  });

  function confirmCancel() {
    Alert.alert(
      "Cancelar reserva",
      "¿Estás seguro de que deseas cancelar esta reserva?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: () => cancelMutation.mutate() },
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
        <Text style={{ color: "#6b7280" }}>Reserva no encontrada</Text>
      </View>
    );
  }

  const b = data;
  const colors = STATUS_COLOR[b.status] ?? STATUS_COLOR.PENDING;
  const canCancel = ["PENDING", "CONFIRMED"].includes(b.status);
  const canReview = b.status === "COMPLETED" && !b.review;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>

        {/* Service card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 28 }}>{TYPE_EMOJI[b.service?.type] ?? "🐾"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>{b.service?.title}</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{b.service?.provider?.name}</Text>
            </View>
            <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{STATUS_LABEL[b.status]}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Detalles</Text>
          <Row label="📅 Fecha" value={new Date(b.startDate).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
          <Row label="🐶 Mascota" value={b.pet?.name} />
          <Row label="💰 Total" value={`$${Number(b.totalPrice).toLocaleString("es-CL")}`} bold />
{b.notes && <Row label="📝 Notas" value={b.notes} />}
        </View>

        {/* Provider */}
        {b.service?.provider && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Proveedor</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>{b.service.provider.name}</Text>
            </View>
          </View>
        )}

        {/* Existing review */}
        {b.review && (
          <View style={{ backgroundColor: "#f0fdf4", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#bbf7d0" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#16a34a", marginBottom: 8 }}>✅ Tu reseña</Text>
            <View style={{ flexDirection: "row", gap: 2, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={{ fontSize: 18, color: i <= b.review.rating ? "#f59e0b" : "#d1d5db" }}>★</Text>
              ))}
            </View>
            {b.review.comment && <Text style={{ fontSize: 13, color: "#374151" }}>{b.review.comment}</Text>}
          </View>
        )}

        {/* Review form */}
        {canReview && !showReviewForm && (
          <Pressable
            onPress={() => setShowReviewForm(true)}
            style={{ backgroundColor: "#fef3c7", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#fde68a" }}
          >
            <Text style={{ color: "#d97706", fontWeight: "700", fontSize: 15 }}>⭐ Dejar una reseña</Text>
          </Pressable>
        )}

        {canReview && showReviewForm && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Califica este servicio</Text>
            <View style={{ alignItems: "center" }}>
              <StarRating value={rating} onChange={setRating} />
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Cuéntanos tu experiencia (opcional)"
              multiline
              numberOfLines={3}
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb", textAlignVertical: "top", minHeight: 80 }}
              placeholderTextColor="#9ca3af"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setShowReviewForm(false)}
                style={{ flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#374151", fontWeight: "600" }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => reviewMutation.mutate({ bookingId: id, rating, comment: comment.trim() || undefined })}
                disabled={reviewMutation.isPending}
                style={{ flex: 2, backgroundColor: "#f59e0b", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
              >
                {reviewMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Enviar reseña</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Cancel button */}
        {canCancel && (
          <Pressable
            onPress={confirmCancel}
            disabled={cancelMutation.isPending}
            style={{ backgroundColor: "#fee2e2", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
          >
            {cancelMutation.isPending ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <Text style={{ color: "#dc2626", fontWeight: "700", fontSize: 15 }}>Cancelar reserva</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ fontSize: 13, color: "#6b7280", flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#111827", fontWeight: bold ? "700" : "400", textAlign: "right", flex: 2 }}>{value}</Text>
    </View>
  );
}

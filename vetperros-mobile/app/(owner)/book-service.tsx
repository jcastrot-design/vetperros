import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const SPECIES_EMOJI: Record<string, string> = { DOG: "🐶", CAT: "🐱", BIRD: "🐦", RABBIT: "🐰", DEFAULT: "🐾" };
const DAY_LABEL: Record<string, string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mié",
  THURSDAY: "Jue", FRIDAY: "Vie", SATURDAY: "Sáb", SUNDAY: "Dom",
};
const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};
const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT   = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function BookServiceScreen() {
  const { serviceId, title } = useLocalSearchParams<{ serviceId: string; title: string }>();
  const queryClient = useQueryClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate]   = useState<Date>(tomorrow);
  const [selectedHour, setSelectedHour]   = useState<number>(10);
  const [notes, setNotes] = useState("");

  // Next 14 days as selectable chips
  const upcomingDays = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + 1 + i); d.setHours(0,0,0,0); return d;
  }), []);

  // Filter by service availability if defined
  const availableDayIndexes = useMemo(() => {
    if (!service?.availability?.length) return null;
    return new Set(service.availability.map((s: any) => DAY_INDEX[s.dayOfWeek]));
  }, [service]);

  const selectableHours = useMemo(() => {
    if (!service?.availability?.length) return HOURS;
    const slots = service.availability.filter(
      (s: any) => DAY_INDEX[s.dayOfWeek] === selectedDate.getDay()
    );
    if (!slots.length) return HOURS;
    const start = parseInt(slots[0].startTime?.split(":")[0] ?? "8");
    const end   = parseInt(slots[0].endTime?.split(":")[0]   ?? "18");
    return HOURS.filter(h => h >= start && h < end);
  }, [service, selectedDate]);

  const { data: service } = useQuery<any>({
    queryKey: ["service", serviceId],
    queryFn: () => api.get(`/mobile/services/${serviceId}`).then((r) => r.data.data),
    enabled: !!serviceId,
  });

  const { data: petsData, isLoading: loadingPets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then((r) => r.data.data),
  });

  const pets = petsData ?? [];

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/mobile/bookings", data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      Toast.show({ type: "success", text1: "¡Reserva creada!", text2: "Te confirmaremos pronto" });
      router.replace("/(owner)/bookings");
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "No se pudo crear la reserva" });
    },
  });

  function handleSubmit() {
    if (!selectedPetId) { Toast.show({ type: "error", text1: "Selecciona una mascota" }); return; }
    const date = new Date(selectedDate);
    date.setHours(selectedHour, 0, 0, 0);
    mutation.mutate({ serviceId, petId: selectedPetId, startDate: date.toISOString(), notes: notes.trim() || undefined });
  }

  const price = service?.pricePerUnit ?? null;
  const serviceFee = price ? Math.round(price * 0.07) : 0;
  const total = price ? price + serviceFee : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Service info */}
          <View style={{ backgroundColor: "#fff7ed", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fed7aa" }}>
            <Text style={{ fontSize: 12, color: "#92400e" }}>Servicio seleccionado</Text>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827", marginTop: 4 }}>
              {decodeURIComponent(title ?? "")}
            </Text>
            {service?.provider && (
              <Text style={{ fontSize: 13, color: "#92400e", marginTop: 2 }}>por {service.provider.name}</Text>
            )}
          </View>

          {/* Availability */}
          {service?.availability?.length > 0 && (
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 }}>🕐 Días disponibles</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {service.availability.map((slot: any) => (
                  <View key={slot.id} style={{ backgroundColor: "#f0fdf4", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#bbf7d0" }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>{DAY_LABEL[slot.dayOfWeek]}</Text>
                    <Text style={{ fontSize: 11, color: "#15803d" }}>{slot.startTime}-{slot.endTime}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pet selector */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 }}>¿Para qué mascota?</Text>
            {loadingPets ? (
              <ActivityIndicator color="#f97316" />
            ) : pets.length === 0 ? (
              <View style={{ alignItems: "center", padding: 12 }}>
                <Text style={{ color: "#6b7280", marginBottom: 10 }}>No tienes mascotas registradas</Text>
                <Pressable onPress={() => router.push("/(owner)/new-pet")} style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>+ Agregar mascota</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {pets.map((pet: any) => (
                  <Pressable
                    key={pet.id}
                    onPress={() => setSelectedPetId(pet.id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, backgroundColor: selectedPetId === pet.id ? "#fff7ed" : "#f9fafb", borderWidth: 1, borderColor: selectedPetId === pet.id ? "#f97316" : "#e5e7eb" }}
                  >
                    <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[pet.species?.toUpperCase()] ?? "🐾"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{pet.name}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{pet.breed ?? pet.species}</Text>
                    </View>
                    {selectedPetId === pet.id && <Text style={{ fontSize: 18, color: "#f97316" }}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Date picker */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 }}>📅 Fecha</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {upcomingDays.map(d => {
                const isSelected = sameDay(d, selectedDate);
                const disabled   = availableDayIndexes ? !availableDayIndexes.has(d.getDay()) : false;
                return (
                  <Pressable
                    key={d.toISOString()}
                    onPress={() => { if (!disabled) { setSelectedDate(d); if (!selectableHours.includes(selectedHour)) setSelectedHour(selectableHours[0] ?? 10); }}}
                    style={{
                      width: 54, paddingVertical: 10, borderRadius: 14, alignItems: "center",
                      backgroundColor: isSelected ? "#f97316" : disabled ? "#f9fafb" : "#fff",
                      borderWidth: 1, borderColor: isSelected ? "#f97316" : "#e5e7eb",
                      opacity: disabled ? 0.35 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: isSelected ? "#fff" : "#9ca3af" }}>
                      {WEEKDAY_SHORT[d.getDay()]}
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: isSelected ? "#fff" : "#111827", marginTop: 2 }}>
                      {d.getDate()}
                    </Text>
                    <Text style={{ fontSize: 10, color: isSelected ? "#ffe0cc" : "#9ca3af" }}>
                      {MONTH_SHORT[d.getMonth()]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Time picker */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 }}>🕐 Hora</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {selectableHours.map(h => (
                <Pressable
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: selectedHour === h ? "#f97316" : "#f9fafb",
                    borderWidth: 1, borderColor: selectedHour === h ? "#f97316" : "#e5e7eb",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700", color: selectedHour === h ? "#fff" : "#374151" }}>
                    {h}:00
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>
              Reserva: {WEEKDAY_SHORT[selectedDate.getDay()]} {selectedDate.getDate()} {MONTH_SHORT[selectedDate.getMonth()]} a las {selectedHour}:00 h
            </Text>
          </View>

          {/* Notes */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>📝 Notas (opcional)</Text>
            <TextInput
              value={notes} onChangeText={setNotes}
              placeholder="Indicaciones especiales, alergias, etc."
              multiline numberOfLines={3}
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb", textAlignVertical: "top", minHeight: 80 }}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Price breakdown */}
          {total !== null && (
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 }}>💰 Resumen de pago</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>Servicio</Text>
                <Text style={{ fontSize: 13, color: "#111827" }}>${price!.toLocaleString("es-CL")}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>Comisión de servicio (7%)</Text>
                <Text style={{ fontSize: 13, color: "#111827" }}>${serviceFee.toLocaleString("es-CL")}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 2 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#f97316" }}>${total.toLocaleString("es-CL")}</Text>
              </View>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Política de cancelación: cancela con al menos 24h de anticipación
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit} disabled={mutation.isPending}
            style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
          >
            {mutation.isPending ? <ActivityIndicator color="#fff" /> : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                Confirmar reserva{total !== null ? ` — $${total.toLocaleString("es-CL")}` : ""}
              </Text>
            )}
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

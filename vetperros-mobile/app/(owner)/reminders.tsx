import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const TYPE_OPTIONS = [
  { key: "VACCINE", label: "💉 Vacuna" },
  { key: "DEWORMING", label: "🐛 Desparasitación" },
  { key: "MEDICATION", label: "💊 Medicamento" },
  { key: "GROOMING", label: "✂️ Grooming" },
  { key: "CHECKUP", label: "🩺 Control" },
  { key: "CUSTOM", label: "📌 Otro" },
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toDateLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function RemindersScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [type, setType] = useState("CUSTOM");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toDateLocal(d);
  });

  const { data: reminders = [], isLoading } = useQuery<any[]>({
    queryKey: ["reminders"],
    queryFn: () => api.get("/mobile/reminders").then((r) => r.data.data),
  });

  const { data: petsData = [] } = useQuery<any[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then((r) => r.data.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/mobile/reminders/${id}`, { action: "complete" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
    onError: () => Toast.show({ type: "error", text1: "No se pudo completar" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/mobile/reminders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
    onError: () => Toast.show({ type: "error", text1: "No se pudo eliminar" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/mobile/reminders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ type: "success", text1: "Recordatorio creado" });
      setShowForm(false);
      setTitle("");
      setSelectedPetId(null);
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al crear" });
    },
  });

  function handleCreate() {
    if (!selectedPetId) { Toast.show({ type: "error", text1: "Selecciona una mascota" }); return; }
    if (!title.trim()) { Toast.show({ type: "error", text1: "Ingresa un título" }); return; }
    if (!dueDate) { Toast.show({ type: "error", text1: "Ingresa una fecha" }); return; }
    createMutation.mutate({ petId: selectedPetId, type, title: title.trim(), dueDate });
  }

  const pending = reminders.filter((r: any) => r.status === "PENDING" || r.status === "SENT");
  const completed = reminders.filter((r: any) => r.status === "COMPLETED" || r.status === "DISMISSED");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Recordatorios</Text>
          <Pressable
            onPress={() => setShowForm(true)}
            style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>+ Nuevo</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color="#f97316" size="large" />
          </View>
        ) : pending.length === 0 && completed.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 48 }}>⏰</Text>
            <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 15 }}>No tienes recordatorios</Text>
            <Text style={{ color: "#9ca3af", marginTop: 4, fontSize: 13 }}>Agrega uno para no olvidar nada</Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Pendientes ({pending.length})</Text>
                <View style={{ gap: 10 }}>
                  {pending.map((r: any) => {
                    const overdue = new Date(r.dueDate) < new Date();
                    return (
                      <View
                        key={r.id}
                        style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: overdue ? "#fecaca" : "#f3f4f6", borderLeftWidth: 4, borderLeftColor: overdue ? "#dc2626" : "#f97316" }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{r.title}</Text>
                            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>🐾 {r.pet?.name}</Text>
                            <Text style={{ fontSize: 12, color: overdue ? "#dc2626" : "#d97706", marginTop: 4, fontWeight: "600" }}>
                              {overdue ? "Vencido · " : ""}{new Date(r.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <Pressable
                              onPress={() => completeMutation.mutate(r.id)}
                              style={{ backgroundColor: "#dcfce7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                            >
                              <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "700" }}>✓</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => deleteMutation.mutate(r.id)}
                              style={{ backgroundColor: "#fee2e2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                            >
                              <Text style={{ fontSize: 12, color: "#dc2626", fontWeight: "700" }}>✕</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {completed.length > 0 && (
              <>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#6b7280", marginTop: 4 }}>Completados ({completed.length})</Text>
                <View style={{ gap: 8 }}>
                  {completed.slice(0, 5).map((r: any) => (
                    <View key={r.id} style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#f3f4f6", opacity: 0.7 }}>
                      <Text style={{ fontSize: 13, color: "#6b7280", textDecorationLine: "line-through" }}>{r.title}</Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>🐾 {r.pet?.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* New reminder modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>Nuevo recordatorio</Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 16, color: "#6b7280" }}>✕</Text>
              </Pressable>
            </View>

            {/* Pet selector */}
            <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 }}>Mascota</Text>
              <View style={{ gap: 8 }}>
                {petsData.map((pet: any) => (
                  <Pressable
                    key={pet.id}
                    onPress={() => setSelectedPetId(pet.id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, backgroundColor: selectedPetId === pet.id ? "#fff7ed" : "#f9fafb", borderWidth: 1, borderColor: selectedPetId === pet.id ? "#f97316" : "#e5e7eb" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{pet.name}</Text>
                    {selectedPetId === pet.id && <Text style={{ color: "#f97316" }}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Type */}
            <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 }}>Tipo</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TYPE_OPTIONS.map((t) => (
                  <Pressable
                    key={t.key}
                    onPress={() => setType(t.key)}
                    style={{ backgroundColor: type === t.key ? "#fff7ed" : "#f9fafb", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: type === t.key ? "#f97316" : "#e5e7eb" }}
                  >
                    <Text style={{ fontSize: 13, color: type === t.key ? "#f97316" : "#374151", fontWeight: "600" }}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Título</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Vacuna antirrábica anual"
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb" }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Due date */}
            <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>📅 Fecha límite</Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb" }}
                placeholderTextColor="#9ca3af"
              />
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Ejemplo: 2025-06-15</Text>
            </View>

            <Pressable
              onPress={handleCreate}
              disabled={createMutation.isPending}
              style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Crear recordatorio</Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

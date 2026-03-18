import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Shield, PlusCircle, CheckCircle, Clock, XCircle, X, Loader2 } from "lucide-react-native";
import Toast from "react-native-toast-message";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE:          { label: "Activa",         bg: "#dcfce7", text: "#16a34a" },
  PENDING_PAYMENT: { label: "Pago pendiente", bg: "#fef3c7", text: "#d97706" },
  CANCELLED:       { label: "Cancelada",      bg: "#fee2e2", text: "#dc2626" },
  EXPIRED:         { label: "Expirada",       bg: "#f3f4f6", text: "#6b7280" },
};

export default function MyPoliciesScreen() {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: policies = [], isLoading } = useQuery<any[]>({
    queryKey: ["my-policies"],
    queryFn: () => api.get("/mobile/insurance/my-policies").then((r) => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ policyId, reason }: { policyId: string; reason: string }) =>
      api.patch(`/mobile/insurance/my-policies/${policyId}`, { action: "cancel", reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-policies"] });
      Toast.show({ type: "success", text1: "Póliza cancelada" });
      setCancellingId(null);
      setCancelReason("");
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al cancelar" });
    },
  });

  const active  = policies.filter((p) => p.status === "ACTIVE");
  const others  = policies.filter((p) => p.status !== "ACTIVE");

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Shield size={22} color="#2563eb" />
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>Mis seguros</Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>Pólizas activas</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/(owner)/insurance/plans")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#2563eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <PlusCircle size={14} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>Contratar</Text>
          </Pressable>
        </View>

        {/* Empty */}
        {policies.length === 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Shield size={48} color="#d1d5db" />
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}>Sin pólizas activas</Text>
            <Text style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
              Protege a tus mascotas contratando un seguro
            </Text>
            <Pressable
              onPress={() => router.push("/(owner)/insurance/plans")}
              style={{ backgroundColor: "#2563eb", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Ver planes</Text>
            </Pressable>
          </View>
        )}

        {/* Active */}
        {active.length > 0 && (
          <>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Pólizas activas
            </Text>
            {active.map((policy: any) => (
              <View
                key={policy.id}
                style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: "#bbf7d0" }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{policy.plan.name}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>{policy.plan.providerName}</Text>
                  </View>
                  <View style={{ backgroundColor: STATUS_CONFIG.ACTIVE.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: STATUS_CONFIG.ACTIVE.text }}>
                      {STATUS_CONFIG.ACTIVE.label}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                  <View>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>Mascota</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{policy.pet.name}</Text>
                  </View>
                  {policy.startDate && (
                    <View>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>Inicio</Text>
                      <Text style={{ fontSize: 13, color: "#111827" }}>
                        {new Date(policy.startDate).toLocaleDateString("es-CL")}
                      </Text>
                    </View>
                  )}
                  {policy.endDate && (
                    <View>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>Vence</Text>
                      <Text style={{ fontSize: 13, color: "#111827" }}>
                        {new Date(policy.endDate).toLocaleDateString("es-CL")}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>Pagado</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>
                      ${policy.totalPaid.toLocaleString("es-CL")} CLP
                    </Text>
                  </View>
                </View>

                {policy.plan.coverages.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {policy.plan.coverages.map((c: string) => (
                      <View key={c} style={{ backgroundColor: "#eff6ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 11, color: "#2563eb" }}>✓ {c}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  onPress={() => { setCancellingId(policy.id); setCancelReason(""); }}
                  style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 }}
                >
                  <XCircle size={14} color="#dc2626" />
                  <Text style={{ fontSize: 12, color: "#dc2626", fontWeight: "600" }}>Cancelar póliza</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {/* History */}
        {others.length > 0 && (
          <>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4 }}>
              Historial
            </Text>
            {others.map((policy: any) => {
              const cfg = STATUS_CONFIG[policy.status] ?? STATUS_CONFIG.EXPIRED;
              return (
                <View key={policy.id} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", opacity: 0.7 }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>{policy.plan.name}</Text>
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>{policy.pet.name} · {policy.plan.providerName}</Text>
                  </View>
                  <View style={{ backgroundColor: cfg.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.text }}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Cancel overlay — inline para no salir del contenedor mobile */}
      {cancellingId && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Cancelar póliza</Text>
              <Pressable onPress={() => setCancellingId(null)} hitSlop={8}>
                <X size={20} color="#6b7280" />
              </Pressable>
            </View>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              La póliza se cancelará de inmediato. Esta acción no tiene reembolso automático.
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Motivo (opcional)"
              multiline
              numberOfLines={3}
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, fontSize: 13, color: "#111827", minHeight: 80, textAlignVertical: "top" }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setCancellingId(null)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: "#374151" }}>Volver</Text>
              </Pressable>
              <Pressable
                onPress={() => cancelMutation.mutate({ policyId: cancellingId!, reason: cancelReason })}
                disabled={cancelMutation.isPending}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: cancelMutation.isPending ? "#fca5a5" : "#dc2626", alignItems: "center" }}
              >
                {cancelMutation.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={{ fontWeight: "700", color: "#fff" }}>Confirmar</Text>
                }
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

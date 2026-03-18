import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Search, CheckCircle } from "lucide-react-native";
import Toast from "react-native-toast-message";

const CATEGORIES = [
  { key: null,        icon: "🐾", label: "Todos"       },
  { key: "WALK",      icon: "🦮", label: "Paseo"       },
  { key: "GROOMING",  icon: "✂️", label: "Grooming"    },
  { key: "VET_HOME",  icon: "🏥", label: "Veterinaria" },
  { key: "DAYCARE",   icon: "🏠", label: "Guardería"   },
  { key: "SITTING",   icon: "🤝", label: "Cuidado"     },
  { key: "BOARDING",  icon: "🛏️", label: "Alojamiento" },
  { key: "INSURANCE", icon: "🛡️", label: "Seguros"     },
];

const TYPE_EMOJI: Record<string, string> = {
  WALK: "🦮", GROOMING: "✂️", VET_HOME: "🏥",
  DAYCARE: "🏠", SITTING: "🤝", BOARDING: "🛏️",
};

const TYPE_LABEL: Record<string, string> = {
  WALK: "Paseo", GROOMING: "Grooming", VET_HOME: "Veterinaria",
  DAYCARE: "Guardería", SITTING: "Cuidado", BOARDING: "Alojamiento",
};

export default function Services() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  // Insurance checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [period, setPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const showInsurance = activeType === "INSURANCE";

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["services", activeType, search],
    queryFn: () => {
      if (showInsurance) return Promise.resolve([]);
      const params = new URLSearchParams();
      if (activeType) params.set("type", activeType);
      if (search) params.set("q", search);
      return api.get(`/mobile/services?${params}`).then(r => r.data.data);
    },
    enabled: !showInsurance,
  });

  const { data: insurancePlans = [], isLoading: loadingPlans, error: insuranceError } = useQuery<any[]>({
    queryKey: ["insurance-plans"],
    queryFn: () => api.get("/mobile/insurance").then(r => r.data.data),
    enabled: showInsurance,
    retry: 1,
  });

  const { data: pets = [] } = useQuery<any[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then(r => r.data.data),
    enabled: showInsurance,
  });

  const services = servicesData ?? [];

  async function handleCheckout() {
    if (!selectedPetId) {
      Toast.show({ type: "error", text1: "Selecciona una mascota" });
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await api.post("/insurance/checkout", {
        planId: selectedPlan.id,
        petId: selectedPetId,
        period,
      });
      const url = res.data?.url;
      if (url) {
        setSelectedPlan(null);
        await Linking.openURL(url);
      } else {
        Toast.show({ type: "error", text1: res.data?.error ?? "No se pudo iniciar el pago" });
      }
    } catch (err: any) {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al conectar con pagos" });
    }
    setCheckoutLoading(false);
  }

  const amount = selectedPlan
    ? period === "ANNUAL" && selectedPlan.annualPrice
      ? selectedPlan.annualPrice
      : selectedPlan.price
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView showsVerticalScrollIndicator={false} pointerEvents={selectedPlan ? "none" : "auto"}>
        <View style={{ padding: 16 }}>

          <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Servicios</Text>

          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 16 }}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar servicios..."
              style={{ flex: 1, paddingVertical: 10, paddingLeft: 8, fontSize: 14, color: "#111827" }}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Banner */}
          <View style={{ backgroundColor: showInsurance ? "#1e40af" : "#f97316", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {showInsurance ? "🛡️ Protege a tu mascota" : "🐶 Servicios para tu mascota"}
            </Text>
            <Text style={{ color: "#fff9", fontSize: 13, marginTop: 4 }}>
              {showInsurance ? "Seguros con cobertura real para tu compañero" : "Paseos, grooming, veterinaria y más"}
            </Text>
            <Pressable
              onPress={() => setActiveType(null)}
              style={{ marginTop: 12, backgroundColor: "#fff", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" }}
            >
              <Text style={{ color: showInsurance ? "#1e40af" : "#f97316", fontWeight: "700", fontSize: 13 }}>
                {showInsurance ? "Ver servicios" : "Ver todos"}
              </Text>
            </Pressable>
          </View>

          {/* Categorías */}
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Categorías</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={String(c.key)}
                onPress={() => setActiveType(c.key)}
                style={{
                  backgroundColor: activeType === c.key ? "#fff7ed" : "#fff",
                  borderRadius: 12, padding: 12, alignItems: "center", width: "30%",
                  borderWidth: 1, borderColor: activeType === c.key ? "#f97316" : "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                <Text style={{ fontSize: 12, color: activeType === c.key ? "#f97316" : "#374151", fontWeight: "600", marginTop: 4 }}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Insurance plans from DB */}
          {showInsurance ? (
            <>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>🛡️ Seguros de mascotas</Text>
              {loadingPlans ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator color="#1e40af" size="large" />
                </View>
              ) : insuranceError ? (
                <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 40 }}>⚠️</Text>
                  <Text style={{ color: "#dc2626", marginTop: 8, textAlign: "center", fontSize: 12 }}>
                    {(insuranceError as any)?.message ?? String(insuranceError)}
                  </Text>
                </View>
              ) : insurancePlans.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ fontSize: 40 }}>🛡️</Text>
                  <Text style={{ color: "#6b7280", marginTop: 8 }}>No hay planes disponibles</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {insurancePlans.map((plan: any) => (
                    <View key={plan.id} style={{ backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#bfdbfe", overflow: "hidden" }}>
                      <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1e40af" }}>{plan.name}</Text>
                          <Text style={{ fontSize: 12, color: "#6b7280" }}>{plan.providerName}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1e40af" }}>
                            ${plan.price.toLocaleString("es-CL")}
                          </Text>
                          <Text style={{ fontSize: 11, color: "#6b7280" }}>/ mes</Text>
                        </View>
                      </View>
                      <View style={{ padding: 14 }}>
                        <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>{plan.description}</Text>
                        {plan.coverages.length > 0 && (
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                            {plan.coverages.map((c: string) => (
                              <View key={c} style={{ backgroundColor: "#f9fafb", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "#e5e7eb" }}>
                                <Text style={{ fontSize: 11, color: "#374151" }}>✓ {c}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        <Pressable
                          onPress={() => { setSelectedPlan(plan); setSelectedPetId(""); setPeriod("MONTHLY"); }}
                          style={{ backgroundColor: "#1e40af", borderRadius: 10, paddingVertical: 10, alignItems: "center" }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Contratar seguro</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
                {activeType ? TYPE_LABEL[activeType] : "Disponibles"}
              </Text>
              {loadingServices ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator color="#f97316" size="large" />
                </View>
              ) : services.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ fontSize: 40 }}>🔍</Text>
                  <Text style={{ color: "#6b7280", marginTop: 8 }}>No se encontraron servicios</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {services.map((s: any) => (
                    <Pressable
                      key={s.id}
                      onPress={() => router.push(`/(owner)/service/${s.id}`)}
                      style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#f3f4f6" }}
                    >
                      <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 28 }}>{TYPE_EMOJI[s.type] ?? "🐾"}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }} numberOfLines={1}>{s.title}</Text>
                        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                          {TYPE_LABEL[s.type] ?? s.type} · {s.provider?.name}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#f97316" }}>
                          ${Number(s.pricePerUnit).toLocaleString("es-CL")}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Ver detalle →</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}

        </View>
      </ScrollView>

      {/* Checkout bottom sheet — inline para no salir del contenedor mobile */}
      {selectedPlan && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%" }}>
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>Contratar seguro</Text>
              <Pressable onPress={() => setSelectedPlan(null)} hitSlop={8}>
                <Text style={{ fontSize: 20, color: "#6b7280" }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
              <View style={{ backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#bfdbfe" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1e40af" }}>{selectedPlan.name}</Text>
                <Text style={{ fontSize: 12, color: "#3b82f6" }}>{selectedPlan.providerName}</Text>
              </View>

              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>Selecciona una mascota</Text>
                {pets.length === 0 ? (
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>No tienes mascotas registradas</Text>
                ) : pets.map((pet: any) => (
                  <Pressable
                    key={pet.id}
                    onPress={() => setSelectedPetId(pet.id)}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, borderWidth: 2, borderColor: selectedPetId === pet.id ? "#1e40af" : "#e5e7eb", backgroundColor: selectedPetId === pet.id ? "#eff6ff" : "#fafafa" }}
                  >
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{pet.name}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{pet.breed ?? pet.species}</Text>
                    </View>
                    {selectedPetId === pet.id && <CheckCircle size={18} color="#1e40af" />}
                  </Pressable>
                ))}
              </View>

              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>Período de pago</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => setPeriod("MONTHLY")} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: period === "MONTHLY" ? "#1e40af" : "#e5e7eb", backgroundColor: period === "MONTHLY" ? "#eff6ff" : "#fafafa", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: period === "MONTHLY" ? "#1e40af" : "#111827" }}>Mensual</Text>
                    <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>${selectedPlan.price.toLocaleString("es-CL")}/mes</Text>
                  </Pressable>
                  {selectedPlan.annualPrice && (
                    <Pressable onPress={() => setPeriod("ANNUAL")} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: period === "ANNUAL" ? "#1e40af" : "#e5e7eb", backgroundColor: period === "ANNUAL" ? "#eff6ff" : "#fafafa", alignItems: "center" }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: period === "ANNUAL" ? "#1e40af" : "#111827" }}>Anual</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>${selectedPlan.annualPrice.toLocaleString("es-CL")}/año</Text>
                      <View style={{ backgroundColor: "#dcfce7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 }}>
                        <Text style={{ fontSize: 10, color: "#16a34a", fontWeight: "700" }}>Ahorra {Math.round(100 - (selectedPlan.annualPrice / (selectedPlan.price * 12)) * 100)}%</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={{ backgroundColor: "#f9fafb", borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: "#e5e7eb" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>Período</Text>
                  <Text style={{ fontSize: 13, color: "#111827" }}>{period === "ANNUAL" ? "Anual" : "Mensual"}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Total</Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e40af" }}>${amount.toLocaleString("es-CL")} CLP</Text>
                </View>
              </View>

              <Pressable onPress={handleCheckout} disabled={checkoutLoading || !selectedPetId} style={{ backgroundColor: !selectedPetId ? "#93c5fd" : "#1e40af", borderRadius: 14, padding: 16, alignItems: "center" }}>
                {checkoutLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Pagar ${amount.toLocaleString("es-CL")} CLP</Text>}
              </Pressable>
              <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", paddingBottom: 8 }}>
                Serás redirigido a Stripe para completar el pago
              </Text>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

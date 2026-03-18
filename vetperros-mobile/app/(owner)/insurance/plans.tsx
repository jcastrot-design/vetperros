import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Shield, ChevronRight, X, CheckCircle } from "lucide-react-native";
import Toast from "react-native-toast-message";

const SPECIES_LABEL: Record<string, string> = {
  DOG: "🐶 Perro", CAT: "🐱 Gato", BIRD: "🐦 Ave", RABBIT: "🐰 Conejo",
};

export default function InsurancePlansScreen() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [period, setPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { data: plans = [], isLoading } = useQuery<any[]>({
    queryKey: ["insurance-plans"],
    queryFn: () => api.get("/mobile/insurance").then((r) => r.data.data),
  });

  const { data: pets = [] } = useQuery<any[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then((r) => r.data.data),
  });

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  const amount = selectedPlan
    ? period === "ANNUAL" && selectedPlan.annualPrice
      ? selectedPlan.annualPrice
      : selectedPlan.price
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Shield size={22} color="#2563eb" />
          <View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>Seguros para mascotas</Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>Protege a tu compañero</Text>
          </View>
        </View>

        {plans.length === 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Shield size={40} color="#d1d5db" />
            <Text style={{ color: "#6b7280", textAlign: "center" }}>No hay planes disponibles en este momento</Text>
          </View>
        )}

        {plans.map((plan: any) => (
          <Pressable
            key={plan.id}
            onPress={() => { setSelectedPlan(plan); setSelectedPetId(""); setPeriod("MONTHLY"); }}
            style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", gap: 10 }}
          >
            {/* Plan header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{plan.name}</Text>
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{plan.providerName}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>
                  ${plan.price.toLocaleString("es-CL")}
                </Text>
                <Text style={{ fontSize: 11, color: "#6b7280" }}>/mes</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={{ fontSize: 13, color: "#4b5563", lineHeight: 18 }} numberOfLines={2}>
              {plan.description}
            </Text>

            {/* Coverages */}
            {plan.coverages.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {plan.coverages.slice(0, 3).map((c: string) => (
                  <View key={c} style={{ backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, color: "#2563eb", fontWeight: "500" }}>✓ {c}</Text>
                  </View>
                ))}
                {plan.coverages.length > 3 && (
                  <View style={{ backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, color: "#6b7280" }}>+{plan.coverages.length - 3} más</Text>
                  </View>
                )}
              </View>
            )}

            {/* Species */}
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {plan.petSpecies.map((s: string) => (
                <Text key={s} style={{ fontSize: 12, color: "#6b7280" }}>{SPECIES_LABEL[s] ?? s}</Text>
              ))}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Text style={{ fontSize: 13, color: "#2563eb", fontWeight: "600" }}>Contratar</Text>
              <ChevronRight size={16} color="#2563eb" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Checkout bottom sheet — inline para no salir del contenedor mobile */}
      {selectedPlan && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" }}>
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Contratar seguro</Text>
              <Pressable onPress={() => setSelectedPlan(null)} hitSlop={8}>
                <X size={22} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
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
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 2, borderColor: selectedPetId === pet.id ? "#2563eb" : "#e5e7eb", backgroundColor: selectedPetId === pet.id ? "#eff6ff" : "#fafafa" }}
                  >
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{pet.name}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{pet.breed ?? pet.species}</Text>
                    </View>
                    {selectedPetId === pet.id && <CheckCircle size={20} color="#2563eb" />}
                  </Pressable>
                ))}
              </View>

              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>Período de pago</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => setPeriod("MONTHLY")} style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: period === "MONTHLY" ? "#2563eb" : "#e5e7eb", backgroundColor: period === "MONTHLY" ? "#eff6ff" : "#fafafa", alignItems: "center" }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: period === "MONTHLY" ? "#2563eb" : "#111827" }}>Mensual</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>${selectedPlan.price.toLocaleString("es-CL")}/mes</Text>
                  </Pressable>
                  {selectedPlan.annualPrice && (
                    <Pressable onPress={() => setPeriod("ANNUAL")} style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: period === "ANNUAL" ? "#2563eb" : "#e5e7eb", backgroundColor: period === "ANNUAL" ? "#eff6ff" : "#fafafa", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: period === "ANNUAL" ? "#2563eb" : "#111827" }}>Anual</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>${selectedPlan.annualPrice.toLocaleString("es-CL")}/año</Text>
                      <View style={{ backgroundColor: "#dcfce7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 }}>
                        <Text style={{ fontSize: 10, color: "#16a34a", fontWeight: "700" }}>
                          Ahorra {Math.round(100 - (selectedPlan.annualPrice / (selectedPlan.price * 12)) * 100)}%
                        </Text>
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
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Total a pagar</Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#2563eb" }}>${amount.toLocaleString("es-CL")} CLP</Text>
                </View>
              </View>

              <Pressable
                onPress={handleCheckout}
                disabled={checkoutLoading || !selectedPetId}
                style={{ backgroundColor: !selectedPetId ? "#93c5fd" : "#2563eb", borderRadius: 14, padding: 16, alignItems: "center" }}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    Pagar ${amount.toLocaleString("es-CL")} CLP
                  </Text>
                )}
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

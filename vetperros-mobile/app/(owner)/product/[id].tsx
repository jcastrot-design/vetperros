import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴", TREATS: "🍖", TOYS: "🎾",
  ACCESSORIES: "🏠", HEALTH: "💊", GROOMING: "🛁", OTHER: "📦",
};

const CATEGORY_LABEL: Record<string, string> = {
  FOOD: "Alimentos", TREATS: "Snacks", TOYS: "Juguetes",
  ACCESSORIES: "Accesorios", HEALTH: "Salud", GROOMING: "Grooming", OTHER: "Otro",
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<any>({
    queryKey: ["product", id],
    queryFn: () => api.get(`/mobile/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      api.post("/mobile/orders", { items: [{ productId: id, quantity }] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Toast.show({ type: "success", text1: "¡Pedido realizado!", text2: "Te contactaremos pronto" });
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al procesar el pedido" });
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#6b7280" }}>Producto no encontrado</Text>
      </View>
    );
  }

  const photos: string[] = (() => {
    try { return JSON.parse(product.photos ?? "[]"); } catch { return []; }
  })();
  const species: string[] = (() => {
    try { return JSON.parse(product.petSpecies ?? "[]"); } catch { return []; }
  })();
  const outOfStock = product.stock === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={{ backgroundColor: "#fff7ed", borderRadius: 20, height: 180, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
          <Text style={{ fontSize: 80 }}>{CATEGORY_EMOJI[product.category] ?? "📦"}</Text>
        </View>

        {/* Title + price */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: "#fff7ed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 }}>
                <Text style={{ fontSize: 11, color: "#f97316", fontWeight: "600" }}>{CATEGORY_LABEL[product.category] ?? product.category}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>{product.title}</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>por {product.seller?.name}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#f97316" }}>${Number(product.price).toLocaleString("es-CL")}</Text>
              <Text style={{ fontSize: 11, color: outOfStock ? "#dc2626" : "#16a34a", fontWeight: "600", marginTop: 2 }}>
                {outOfStock ? "Sin stock" : `${product.stock} en stock`}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {product.description && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 }}>Descripción</Text>
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 22 }}>{product.description}</Text>
          </View>
        )}

        {/* Species */}
        {species.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 10 }}>🐾 Para mascotas</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {species.map((s) => (
                <View key={s} style={{ backgroundColor: "#f0fdf4", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#bbf7d0" }}>
                  <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quantity + Buy */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Cantidad</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 18, color: "#374151" }}>−</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", minWidth: 24, textAlign: "center" }}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={outOfStock}
              style={{ width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 18, color: "#374151" }}>+</Text>
            </Pressable>
            <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 8 }}>
              Total: <Text style={{ fontWeight: "700", color: "#f97316" }}>${(Number(product.price) * quantity).toLocaleString("es-CL")}</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => orderMutation.mutate()}
            disabled={outOfStock || orderMutation.isPending}
            style={{ backgroundColor: outOfStock ? "#e5e7eb" : "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
          >
            {orderMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: outOfStock ? "#9ca3af" : "#fff", fontWeight: "700", fontSize: 16 }}>
                {outOfStock ? "Sin stock" : `Comprar — $${(Number(product.price) * quantity).toLocaleString("es-CL")}`}
              </Text>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

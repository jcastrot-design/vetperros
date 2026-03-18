import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Search, ShoppingCart } from "lucide-react-native";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const CATEGORIES: { icon: string; label: string; value: string }[] = [
  { icon: "🦴", label: "Alimentos", value: "FOOD" },
  { icon: "🍖", label: "Snacks", value: "TREATS" },
  { icon: "🎾", label: "Juguetes", value: "TOYS" },
  { icon: "🏠", label: "Accesorios", value: "ACCESSORIES" },
  { icon: "💊", label: "Salud", value: "HEALTH" },
  { icon: "🛁", label: "Grooming", value: "GROOMING" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴", TREATS: "🍖", TOYS: "🎾",
  ACCESSORIES: "🏠", HEALTH: "💊", GROOMING: "🛁", OTHER: "📦",
};

type CartItem = { productId: string; title: string; price: number; quantity: number };

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["products", activeCategory, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (search) params.set("q", search);
      return api.get(`/mobile/products?${params}`).then((r) => r.data.data);
    },
  });

  const orderMutation = useMutation({
    mutationFn: (items: CartItem[]) =>
      api.post("/mobile/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: () => {
      setCart([]);
      setShowCart(false);
      Toast.show({ type: "success", text1: "¡Pedido realizado!", text2: "Te contactaremos pronto" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "Error al procesar el pedido" });
    },
  });

  function addToCart(product: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product.id, title: product.title, price: product.price, quantity: 1 }];
    });
    Toast.show({ type: "success", text1: "Agregado al carrito", visibilityTime: 1000 });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function confirmOrder() {
    if (cart.length === 0) return;
    Alert.alert(
      "Confirmar pedido",
      `Total: $${totalAmount.toLocaleString("es-CL")}\n¿Deseas proceder?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => orderMutation.mutate(cart) },
      ]
    );
  }

  const totalAmount = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (showCart) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Pressable onPress={() => setShowCart(false)}>
            <Text style={{ fontSize: 16, color: "#f97316", fontWeight: "600" }}>← Volver</Text>
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", flex: 1 }}>Mi carrito</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {cart.length === 0 ? (
            <View style={{ paddingVertical: 60, alignItems: "center" }}>
              <Text style={{ fontSize: 40 }}>🛒</Text>
              <Text style={{ color: "#6b7280", marginTop: 8 }}>Tu carrito está vacío</Text>
            </View>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item.productId} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{item.title}</Text>
                    <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                      ${item.price.toLocaleString("es-CL")} × {item.quantity}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#f97316" }}>
                    ${(item.price * item.quantity).toLocaleString("es-CL")}
                  </Text>
                  <Pressable onPress={() => removeFromCart(item.productId)}>
                    <Text style={{ color: "#ef4444", fontSize: 18 }}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", marginTop: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>Total</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#f97316" }}>${totalAmount.toLocaleString("es-CL")}</Text>
                </View>
                <Pressable
                  onPress={confirmOrder}
                  disabled={orderMutation.isPending}
                  style={{ backgroundColor: "#f97316", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                >
                  {orderMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Realizar pedido</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>

          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Marketplace</Text>
            <Pressable onPress={() => setShowCart(true)} style={{ position: "relative" }}>
              <View style={{ backgroundColor: "#f97316", borderRadius: 10, padding: 8 }}>
                <ShoppingCart size={20} color="#fff" />
              </View>
              {totalItems > 0 && (
                <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Search */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 16 }}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar productos..."
              style={{ flex: 1, paddingVertical: 10, paddingLeft: 8, fontSize: 14, color: "#111827" }}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Banner */}
          <View style={{ backgroundColor: "#f97316", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>🐾 Todo para tu mascota</Text>
            <Text style={{ color: "#fff9", fontSize: 13, marginTop: 4 }}>Envío gratis en compras +$25.000</Text>
            <Pressable
              onPress={() => setActiveCategory(null)}
              style={{ marginTop: 12, backgroundColor: "#fff", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" }}
            >
              <Text style={{ color: "#f97316", fontWeight: "700", fontSize: 13 }}>Ver todo</Text>
            </Pressable>
          </View>

          {/* Categories */}
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Categorías</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => setActiveCategory(activeCategory === c.value ? null : c.value)}
                style={{
                  backgroundColor: activeCategory === c.value ? "#fff7ed" : "#fff",
                  borderRadius: 12, padding: 12, alignItems: "center", width: "30%",
                  borderWidth: 1, borderColor: activeCategory === c.value ? "#f97316" : "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                <Text style={{ fontSize: 12, color: activeCategory === c.value ? "#f97316" : "#374151", fontWeight: "600", marginTop: 4 }}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Products */}
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
            {activeCategory ? CATEGORIES.find((c) => c.value === activeCategory)?.label ?? activeCategory : "Destacados"}
          </Text>

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color="#f97316" size="large" />
            </View>
          ) : products.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={{ color: "#6b7280", marginTop: 8 }}>No se encontraron productos</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {products.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/(owner)/product/${p.id}`)} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
                  <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>{CATEGORY_EMOJI[p.category] ?? "📦"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{p.title}</Text>
                    <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }} numberOfLines={1}>
                      {p.seller?.name} · {p.stock > 0 ? `${p.stock} en stock` : "Sin stock"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#f97316" }}>${Number(p.price).toLocaleString("es-CL")}</Text>
                    <Pressable
                      onPress={() => addToCart(p)}
                      disabled={p.stock === 0}
                      style={{ marginTop: 6, backgroundColor: p.stock === 0 ? "#e5e7eb" : "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
                    >
                      <Text style={{ color: p.stock === 0 ? "#9ca3af" : "#fff", fontSize: 12, fontWeight: "600" }}>
                        {p.stock === 0 ? "Agotado" : "Agregar"}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

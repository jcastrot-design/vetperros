import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, Linking, ActivityIndicator } from "react-native";
import { Tabs } from "expo-router";
import { Home, ShoppingBag, Search, Users, PawPrint, Siren, X, Phone, MapPin, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api/client";

function TabIcon({ icon: Icon, color }: { icon: any; color: string }) {
  return <Icon size={22} color={color} />;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  is24h: boolean;
}

function EmergencyFAB() {
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  function handleOpen() {
    setOpen(true);
    setLoading(true);
    api.get("/mobile/vets/emergency")
      .then(r => setClinics(r.data ?? []))
      .catch(() => setClinics([]))
      .finally(() => setLoading(false));
  }

  return (
    <>
      {/* FAB */}
      <Pressable
        onPress={handleOpen}
        style={{
          position: "absolute",
          right: 16,
          bottom: 70 + insets.bottom,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: "#ef4444",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#ef4444",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 100,
        }}
      >
        <Siren size={22} color="#fff" />
      </Pressable>

      {/* Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 16 }}>
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#fee2e2" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Siren size={20} color="#ef4444" />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#ef4444" }}>Emergencia Veterinaria</Text>
                </View>
                <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                  <X size={20} color="#6b7280" />
                </Pressable>
              </View>

              <Text style={{ fontSize: 13, color: "#6b7280", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
                Si tu mascota tiene una emergencia, contacta de inmediato:
              </Text>

              <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
                {loading && (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <ActivityIndicator color="#ef4444" size="large" />
                  </View>
                )}

                {!loading && clinics.length === 0 && (
                  <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <Text style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                      No hay clínicas de emergencia registradas.{"\n"}Busca veterinarias disponibles en la app.
                    </Text>
                  </View>
                )}

                {!loading && clinics.map(clinic => (
                  <View key={clinic.id} style={{ borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 14, gap: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", flex: 1 }}>{clinic.name}</Text>
                      {clinic.is24h && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Clock size={10} color="#16a34a" />
                          <Text style={{ fontSize: 10, color: "#16a34a", fontWeight: "600" }}>24h</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4 }}>
                      <MapPin size={12} color="#9ca3af" style={{ marginTop: 2 }} />
                      <Text style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>{clinic.address}</Text>
                    </View>
                    {clinic.phone && (
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
                        style={{ backgroundColor: "#ef4444", borderRadius: 10, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}
                      >
                        <Phone size={14} color="#fff" />
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Llamar ahora</Text>
                      </Pressable>
                    )}
                  </View>
                ))}

                {!loading && clinics.length > 0 && (
                  <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", paddingTop: 4 }}>
                    En caso de emergencia grave, acude directamente a la clínica más cercana.
                  </Text>
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#f97316",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            borderTopColor: "#e5e7eb",
            height: 56,
            paddingTop: 6,
            paddingBottom: 6,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: "500",
          },
          tabBarItemStyle: {
            flex: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color }) => <TabIcon icon={Home} color={color} />,
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: "Servicios",
            tabBarIcon: ({ color }) => <TabIcon icon={Search} color={color} />,
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: "Mascotas",
            tabBarIcon: ({ color }) => <TabIcon icon={PawPrint} color={color} />,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            tabBarIcon: ({ color }) => <TabIcon icon={ShoppingBag} color={color} />,
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: "Comunidad",
            tabBarIcon: ({ color }) => <TabIcon icon={Users} color={color} />,
          }}
        />
        <Tabs.Screen name="chat" options={{ href: null }} />
      </Tabs>
      <EmergencyFAB />
    </View>
  );
}

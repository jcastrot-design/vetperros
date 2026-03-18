import { Tabs } from "expo-router";
import { Home, ShoppingBag, Search, MessageCircle, PawPrint } from "lucide-react-native";

function TabIcon({ icon: Icon, color }: { icon: any; color: string }) {
  return <Icon size={22} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopColor: "#e5e7eb",
          paddingBottom: 4,
          height: 60,
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
        name="chat"
        options={{
          title: "Mensajes",
          tabBarIcon: ({ color }) => <TabIcon icon={MessageCircle} color={color} />,
        }}
      />
    </Tabs>
  );
}

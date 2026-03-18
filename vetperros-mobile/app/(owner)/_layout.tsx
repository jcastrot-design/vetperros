import { Stack } from "expo-router";

export default function OwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="bookings/index"
        options={{ headerShown: true, title: "Mis Reservas", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="bookings/[id]"
        options={{ headerShown: true, title: "Detalle Reserva", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="pets/[id]"
        options={{ headerShown: true, title: "Mi Mascota", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: "Notificaciones", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="new-pet"
        options={{ headerShown: true, title: "Nueva Mascota", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="book-service"
        options={{ headerShown: true, title: "Reservar Servicio", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="chat-room"
        options={{ headerShown: true, headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="service/[id]"
        options={{ headerShown: true, title: "Detalle Servicio", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="edit-pet"
        options={{ headerShown: true, title: "Editar Mascota", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerShown: true, title: "Mi Perfil", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="reminders"
        options={{ headerShown: true, title: "Recordatorios", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: true, title: "Detalle Producto", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="insurance/plans"
        options={{ headerShown: true, title: "Seguros", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="insurance/my-policies"
        options={{ headerShown: true, title: "Mis Seguros", headerBackTitle: "Atrás" }}
      />
      <Stack.Screen
        name="game"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

# CLAUDE.md — VetPerros Mobile

## Stack
- **Expo SDK 52** + **expo-router v4** (file-based, igual que Next.js App Router)
- **NativeWind v4** para estilos (Tailwind en React Native)
- **TanStack Query v5** para server state
- **Zustand v5** para estado global (carrito, sesión)
- **Backend:** https://vetperros.vercel.app/api/mobile (o localhost:3000/api en dev)

## Reglas absolutas

### NUNCA
- Usar `<div>`, `<p>`, `<span>`, `<button>` — son web. En RN usas `<View>`, `<Text>`, `<Pressable>`
- Todo texto DEBE estar dentro de `<Text>`. Si no, crash.
- Usar `alert()`, `localStorage`, `document`, `window` — no existen en RN
- Usar `position: fixed` — usa `SafeAreaView` + posición absoluta
- Tocar `android/` o `ios/` directamente — usar `npx expo prebuild`
- `FlatList` para listas > 20 items — usar `FlashList`
- Animaciones con `Animated` de RN core — usar `react-native-reanimated`

### SIEMPRE
- Envolver cada screen con `<SafeAreaView className="flex-1">`
- `<KeyboardAvoidingView>` en screens con inputs (behavior "padding" en iOS, "height" en Android)
- Compilar después de cada cambio significativo: `npx expo start`
- Verificar en iOS Simulator Y Android Emulator

## Equivalencias web → mobile

| Web (petmatch) | Mobile (vetperros-mobile) |
|----------------|--------------------------|
| `src/lib/actions/*.ts` | `app/api/mobile/*/route.ts` en el backend |
| `<Link href="...">` (Next) | `<Link href="...">` (expo-router, igual) |
| `useRouter()` | `router` de expo-router |
| `toast.success()` (sonner) | `Toast.show({ type: "success" })` |
| `useState` + `fetch` | `useQuery` de TanStack Query |
| `localStorage` | `SecureStore` (tokens) o `AsyncStorage` (no sensible) |
| shadcn `<Button>` | `<Pressable>` con estilos NativeWind |
| shadcn `<Card>` | `<View className="bg-white rounded-2xl shadow-sm p-4">` |
| shadcn `<Input>` | `<TextInput className="border border-gray-300 rounded-xl px-4 py-3">` |
| `<img>` | `<Image>` de `expo-image` (con contentFit="cover") |
| Leaflet maps | `<MapView>` de `react-native-maps` |
| Framer Motion | `react-native-reanimated` |

## Autenticación mobile
- Token JWT guardado en `SecureStore` con key `session_token`
- Usuario guardado en `SecureStore` con key `session_user`
- El `useAuthStore` (Zustand) carga la sesión al arrancar la app
- Todos los endpoints de `/api/mobile/*` usan `getMobileSession(req)` del helper `src/lib/mobile/auth.ts`

## Estructura de carpetas
```
app/
  _layout.tsx         # Root: QueryClient, Stripe, BottomSheet
  index.tsx           # Redirect según rol
  (auth)/             # signin, signup (sin tabs)
  (owner)/            # Bottom tabs para OWNER
    _layout.tsx       # <Tabs> con 5 items
    index.tsx         # Dashboard
    marketplace/      # Lista + detalle + carrito + checkout
    services/         # Buscar + detalle + reservar
    pets/             # Mis mascotas + detalle + nueva
    bookings/         # Mis reservas + detalle
    chat/             # Lista chats + sala
  (provider)/         # Para WALKER y VET
```

## API endpoints disponibles (backend)
- `POST /api/mobile/auth/signin` → login, retorna JWT
- `POST /api/mobile/auth/register` → registro
- `GET /api/mobile/users/me` → perfil del usuario
- `PATCH /api/mobile/users/me` → actualizar perfil + pushToken
- `GET /api/mobile/pets` → mis mascotas
- `POST /api/mobile/pets` → crear mascota
- `GET /api/mobile/pets/:id` → detalle mascota
- `GET /api/mobile/services` → buscar servicios
- `GET /api/mobile/bookings` → mis reservas
- `POST /api/mobile/bookings` → crear reserva
- `GET /api/mobile/bookings/:id` → detalle reserva
- `PATCH /api/mobile/bookings/:id` → cancelar reserva
- `GET /api/mobile/notifications` → notificaciones

## Colores brand
- Naranja principal: `bg-orange-500` / `#f97316`
- Teal accent: `bg-teal-400` / `#00c8b4`
- Fondo: `bg-gray-50`
- Cards: `bg-white`

## Flujo de datos (patrón para CADA feature)
1. Screen llama `useQuery({ queryKey: [...], queryFn: () => api.get(...) })`
2. TanStack Query cachea y maneja loading/error/refetch
3. Mutaciones usan `useMutation` + `queryClient.invalidateQueries`
4. Estado global (carrito, sesión) → Zustand store

## Comandos útiles
```bash
npx expo start            # Dev server (escanear QR con Expo Go)
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo prebuild         # Generar ios/ y android/ nativos
npx expo install <pkg>    # Instalar con versiones compatibles
```

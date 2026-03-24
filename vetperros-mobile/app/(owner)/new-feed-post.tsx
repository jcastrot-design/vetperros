import { useState } from "react";
import {
  View, Text, Pressable, TextInput, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { X, Camera, Video, Image as ImageIcon, ChevronDown } from "lucide-react-native";

async function compressAndEncode(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return `data:image/jpeg;base64,${result.base64}`;
}

export default function NewFeedPostScreen() {
  const queryClient = useQueryClient();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const { data: petsData } = useQuery({
    queryKey: ["pets"],
    queryFn: () => api.get("/mobile/pets").then(r => r.data.data ?? []),
  });
  const pets: any[] = petsData ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/mobile/feed", data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "No se pudo publicar. Intenta de nuevo."),
  });

  async function pickMedia(mediaType: "photo" | "video" | "all") {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para subir fotos y videos.");
      return;
    }

    if (mediaType === "video") {
      Alert.alert("Próximamente", "La subida de videos estará disponible próximamente.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAsset(result.assets[0]);
    }
  }

  async function handlePost() {
    if (!asset) return;
    setUploading(true);
    try {
      const mediaData = await compressAndEncode(asset.uri);
      await createMutation.mutateAsync({
        mediaData,
        mediaType: "PHOTO",
        caption: caption.trim() || undefined,
        petId: selectedPetId || undefined,
      });
    } catch (e) {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const isLoading = uploading || createMutation.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <X size={22} color="#374151" />
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Nueva publicación</Text>
          <Pressable
            onPress={handlePost}
            disabled={!asset || isLoading}
            style={{ backgroundColor: asset && !isLoading ? "#f97316" : "#e5e7eb", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: 14, fontWeight: "700", color: asset ? "#fff" : "#9ca3af" }}>Publicar</Text>
            }
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Media picker */}
          {!asset ? (
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>Selecciona un archivo</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => pickMedia("photo")}
                  style={{ flex: 1, borderWidth: 2, borderColor: "#f97316", borderStyle: "dashed", borderRadius: 16, paddingVertical: 28, alignItems: "center", gap: 8 }}
                >
                  <ImageIcon size={28} color="#f97316" />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#f97316" }}>Foto</Text>
                </Pressable>
                <Pressable
                  onPress={() => pickMedia("video")}
                  style={{ flex: 1, borderWidth: 2, borderColor: "#8b5cf6", borderStyle: "dashed", borderRadius: 16, paddingVertical: 28, alignItems: "center", gap: 8 }}
                >
                  <Video size={28} color="#8b5cf6" />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#8b5cf6" }}>Video</Text>
                  <Text style={{ fontSize: 10, color: "#8b5cf6", opacity: 0.8 }}>próximamente</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: asset.uri }}
                  style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => setAsset(null)}
                  style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 16, padding: 6 }}
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => pickMedia("photo")}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 }}
              >
                <Camera size={14} color="#6b7280" />
                <Text style={{ fontSize: 12, color: "#6b7280" }}>Cambiar foto</Text>
              </Pressable>
            </View>
          )}

          {/* Caption */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>Descripción (opcional)</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Escribe algo sobre tu mascota..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, fontSize: 14, color: "#111827", minHeight: 80, textAlignVertical: "top" }}
            />
            <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "right" }}>{caption.length}/500</Text>
          </View>

          {/* Pet tag */}
          {pets.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>Etiquetar mascota (opcional)</Text>
              <Pressable
                onPress={() => setShowPetPicker(!showPetPicker)}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}
              >
                <Text style={{ fontSize: 14, color: selectedPet ? "#111827" : "#9ca3af" }}>
                  {selectedPet ? `🐾 ${selectedPet.name}` : "Seleccionar mascota"}
                </Text>
                <ChevronDown size={16} color="#9ca3af" />
              </Pressable>
              {showPetPicker && (
                <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <Pressable
                    onPress={() => { setSelectedPetId(null); setShowPetPicker(false); }}
                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>Sin etiquetar</Text>
                  </Pressable>
                  {pets.map((pet: any) => (
                    <Pressable
                      key={pet.id}
                      onPress={() => { setSelectedPetId(pet.id); setShowPetPicker(false); }}
                      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", backgroundColor: selectedPetId === pet.id ? "#fff7ed" : "#fff" }}
                    >
                      <Text style={{ fontSize: 14, color: "#111827", fontWeight: selectedPetId === pet.id ? "600" : "400" }}>
                        🐾 {pet.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useState } from "react";
import {
  View, Text, Pressable, FlatList, ActivityIndicator,
  RefreshControl, TextInput, Modal, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import {
  Heart, MessageCircle, Plus, AlertTriangle, ChevronRight,
  Send, X, PawPrint, Play,
} from "lucide-react-native";

const SPECIES_EMOJI: Record<string, string> = { DOG: "🐶", CAT: "🐱", BIRD: "🐦", RABBIT: "🐰", DEFAULT: "🐾" };
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  LOST:     { label: "Perdido",    bg: "#fee2e2", text: "#dc2626" },
  FOUND:    { label: "Encontrado", bg: "#fef3c7", text: "#d97706" },
  REUNITED: { label: "Reunido",    bg: "#dcfce7", text: "#16a34a" },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return `Hace ${Math.floor(diff / 86400)}d`;
}

// ── Feed Post Card ────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onComment }: { post: any; onLike: (id: string) => void; onComment: (post: any) => void }) {
  return (
    <View style={{ backgroundColor: "#fff", marginBottom: 8 }}>
      {/* Author */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center" }}>
          {post.author?.avatarUrl
            ? <Image source={{ uri: post.author.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{post.author?.name?.[0]?.toUpperCase() ?? "U"}</Text>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{post.author?.name ?? "Usuario"}</Text>
          {post.pet && (
            <Text style={{ fontSize: 11, color: "#f97316" }}>🐾 {post.pet.name}</Text>
          )}
        </View>
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(post.createdAt)}</Text>
      </View>

      {/* Media */}
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: post.mediaType === "VIDEO" ? (post.thumbnailUrl ?? post.mediaUrl) : post.mediaUrl }}
          style={{ width: "100%", aspectRatio: 1 }}
          contentFit="cover"
        />
        {post.mediaType === "VIDEO" && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 36, padding: 14 }}>
              <Play size={28} color="#fff" fill="#fff" />
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 14, paddingTop: 10 }}>
        <Pressable onPress={() => onLike(post.id)} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Heart size={22} color={post.isLikedByMe ? "#ef4444" : "#374151"} fill={post.isLikedByMe ? "#ef4444" : "transparent"} />
          <Text style={{ fontSize: 13, color: "#374151" }}>{post.likesCount}</Text>
        </Pressable>
        <Pressable onPress={() => onComment(post)} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <MessageCircle size={22} color="#374151" />
          <Text style={{ fontSize: 13, color: "#374151" }}>{post.commentsCount}</Text>
        </Pressable>
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={{ paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10 }}>
          <Text style={{ fontSize: 13, color: "#111827", lineHeight: 18 }}>
            <Text style={{ fontWeight: "700" }}>{post.author?.name} </Text>
            {post.caption}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Comments Modal ────────────────────────────────────────────────────────────
function CommentsModal({ post, onClose }: { post: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["feed-comments", post.id],
    queryFn: () => api.get(`/mobile/feed/${post.id}/comments`).then(r => r.data.data ?? []),
  });

  const addMutation = useMutation({
    mutationFn: () => api.post(`/mobile/feed/${post.id}/comments`, { content: text }).then(r => r.data),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed-comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const comments: any[] = data ?? [];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={onClose} />
      <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "70%", paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Comentarios</Text>
          <Pressable onPress={onClose} hitSlop={8}><X size={20} color="#6b7280" /></Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#f97316" style={{ padding: 24 }} />
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
            {comments.length === 0 && (
              <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Sin comentarios aún. ¡Sé el primero!</Text>
            )}
            {comments.map((c: any) => (
              <View key={c.id} style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{c.author?.name?.[0]?.toUpperCase() ?? "U"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#111827" }}>
                    <Text style={{ fontWeight: "700" }}>{c.author?.name} </Text>{c.content}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{timeAgo(c.createdAt)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Agrega un comentario..."
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: "#111827" }}
          />
          <Pressable
            onPress={() => text.trim() && addMutation.mutate()}
            disabled={!text.trim() || addMutation.isPending}
          >
            {addMutation.isPending
              ? <ActivityIndicator size="small" color="#f97316" />
              : <Send size={20} color={text.trim() ? "#f97316" : "#d1d5db"} />
            }
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SocialScreen() {
  const queryClient = useQueryClient();
  const [commentPost, setCommentPost] = useState<any>(null);

  const {
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      api.get(`/mobile/feed${pageParam ? `?cursor=${pageParam}` : ""}`).then(r => r.data.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => lastPage?.nextCursor ?? null,
  });

  const { data: socialData } = useQuery({
    queryKey: ["social"],
    queryFn: () => api.get("/mobile/social").then(r => r.data.data),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.post(`/mobile/feed/${postId}/like`).then(r => r.data.data),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === postId
                ? { ...p, isLikedByMe: !p.isLikedByMe, likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1 }
                : p
            ),
          })),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  const allPosts = data?.pages.flatMap((p: any) => p.posts ?? []) ?? [];
  const lostPets = socialData?.lostPets ?? [];
  const adoptions = socialData?.adoptions ?? [];

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>Comunidad</Text>
        <Pressable
          onPress={() => router.push("/(owner)/new-feed-post")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f97316", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
        >
          <Plus size={16} color="#fff" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Publicar</Text>
        </Pressable>
      </View>

      {/* PetMatch banner */}
      <Pressable
        onPress={() => router.push("/(owner)/match")}
        style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 20, backgroundColor: "#f97316", overflow: "hidden" }}
      >
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 36 }}>🐾❤️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}>PetMatch</Text>
            <Text style={{ fontSize: 12, color: "#ffe0cc" }}>Encuentra compañeros para tu mascota</Text>
          </View>
          <ChevronRight size={18} color="#fff" />
        </View>
      </Pressable>

      {/* Feed title */}
      {allPosts.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 6, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", paddingTop: 12 }}>📸 Fotos y videos</Text>
        </View>
      )}

      {isLoading && <ActivityIndicator color="#f97316" style={{ padding: 24 }} />}
    </View>
  );

  const ListFooter = (
    <View style={{ backgroundColor: "#f9fafb", paddingTop: 8 }}>
      {isFetchingNextPage && <ActivityIndicator color="#f97316" style={{ paddingVertical: 16 }} />}

      {/* Mascotas perdidas */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} color="#dc2626" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Mascotas perdidas</Text>
          </View>
          <Pressable onPress={() => router.push("/(owner)/lost-pets/new")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Plus size={14} color="#f97316" />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#f97316" }}>Reportar</Text>
          </Pressable>
        </View>
        {lostPets.length === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>No hay reportes activos</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {lostPets.map((pet: any) => {
              const cfg = STATUS_CONFIG[pet.status] ?? STATUS_CONFIG.LOST;
              return (
                <Pressable
                  key={pet.id}
                  onPress={() => router.push(`/(owner)/lost-pets/${pet.id}`)}
                  style={{ width: 150, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f3f4f6" }}
                >
                  <View style={{ height: 70, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 36 }}>{SPECIES_EMOJI[pet.species?.toUpperCase()] ?? "🐾"}</Text>
                  </View>
                  <View style={{ padding: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{pet.name}</Text>
                      <View style={{ backgroundColor: cfg.bg, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontSize: 9, fontWeight: "700", color: cfg.text }}>{cfg.label}</Text>
                      </View>
                    </View>
                    {pet.city && <Text style={{ fontSize: 10, color: "#6b7280" }}>📍 {pet.city}</Text>}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Adopción */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Heart size={16} color="#ec4899" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>En adopción</Text>
          </View>
          <Pressable onPress={() => router.push("/(owner)/adoption/new")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Plus size={14} color="#f97316" />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#f97316" }}>Publicar</Text>
          </Pressable>
        </View>
        {adoptions.length === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>No hay mascotas en adopción</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {adoptions.map((post: any) => (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/(owner)/adoption/${post.id}`)}
                style={{ backgroundColor: "#fff", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#f3f4f6" }}
              >
                <View style={{ width: 50, height: 50, backgroundColor: "#fdf2f8", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 26 }}>{SPECIES_EMOJI[post.pet?.species?.toUpperCase()] ?? "🐾"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{post.pet?.name}</Text>
                  <Text style={{ fontSize: 11, color: "#6b7280" }}>{post.pet?.breed ?? post.pet?.species}</Text>
                  <Text style={{ fontSize: 11, color: post.adoptionFee > 0 ? "#f97316" : "#16a34a", fontWeight: "600", marginTop: 2 }}>
                    {post.adoptionFee > 0 ? `$${post.adoptionFee.toLocaleString("es-CL")}` : "Gratis"}
                  </Text>
                </View>
                <ChevronRight size={14} color="#9ca3af" />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <FlatList
        data={allPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={id => likeMutation.mutate(id)}
            onComment={post => setCommentPost(post)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 }}>
              <PawPrint size={40} color="#d1d5db" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 12 }}>Sé el primero en publicar</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 6 }}>
                Comparte fotos y videos de tus mascotas con la comunidad
              </Text>
              <Pressable
                onPress={() => router.push("/(owner)/new-feed-post")}
                style={{ marginTop: 16, backgroundColor: "#f97316", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Publicar ahora</Text>
              </Pressable>
            </View>
          ) : null
        }
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f97316" />}
        showsVerticalScrollIndicator={false}
      />

      {commentPost && (
        <CommentsModal post={commentPost} onClose={() => setCommentPost(null)} />
      )}
    </SafeAreaView>
  );
}

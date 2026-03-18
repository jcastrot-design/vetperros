import { getMyAdoptionPosts } from "@/lib/actions/adoptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, PlusCircle, PawPrint, Users, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";
import { postStatusLabels, postStatusColors } from "@/lib/validations/adoption";
import { PostStatusButton } from "@/components/adoption/post-status-button";

export default async function MyAdoptionPostsPage() {
  const posts = await getMyAdoptionPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/adoption">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-500" />
            Mis publicaciones
          </h1>
          <p className="text-muted-foreground">Mascotas que has publicado en adopción</p>
        </div>
        <Link href="/adoption/new">
          <Button className="bg-rose-500 hover:bg-rose-600">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Publicar mascota
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <PawPrint className="h-14 w-14 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">No tienes publicaciones activas</p>
          <p className="text-muted-foreground">Publica una mascota para encontrarle un hogar.</p>
          <Link href="/adoption/new">
            <Button className="bg-rose-500 hover:bg-rose-600 mt-2">Publicar en adopción</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const photos = parseJsonArray(post.pet.photos);
            return (
              <Card key={post.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {photos[0] ? (
                        <img src={photos[0]} alt={post.pet.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-2xl">{post.pet.species === "DOG" ? "🐶" : "🐱"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold">{post.pet.name}</p>
                          {post.pet.breed && (
                            <p className="text-sm text-muted-foreground">{post.pet.breed}</p>
                          )}
                        </div>
                        <Badge variant={postStatusColors[post.status] as "default" | "secondary" | "destructive" | "outline"}>
                          {postStatusLabels[post.status]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {post._count.applications} solicitudes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount} vistas
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Link href={`/adoption/my-posts/${post.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Ver solicitudes
                          </Button>
                        </Link>
                        <Link href={`/adoption/${post.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            Ver publicación
                          </Button>
                        </Link>
                        {post.status === "ACTIVE" && (
                          <PostStatusButton postId={post.id} currentStatus="ACTIVE" />
                        )}
                        {post.status === "PAUSED" && (
                          <PostStatusButton postId={post.id} currentStatus="PAUSED" />
                        )}
                        {(post.status === "ACTIVE" || post.status === "PAUSED") && (
                          <PostStatusButton postId={post.id} currentStatus={post.status} markAdopted />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

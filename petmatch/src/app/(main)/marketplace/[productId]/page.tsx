import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, User } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/validations/product";
import { parseJsonArray } from "@/lib/json-arrays";
import { AddToCartButton } from "@/components/marketplace/add-to-cart-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: { select: { name: true, avatarUrl: true } },
    },
  });

  if (!product) notFound();

  const photos = parseJsonArray(product.photos);
  const petSpecies = parseJsonArray(product.petSpecies);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Photo */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {photos[0] ? (
            <img src={photos[0]} alt={product.title} className="object-cover w-full h-full rounded-lg" />
          ) : (
            <span className="text-6xl">{categoryIcons[product.category] || "📦"}</span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {categoryIcons[product.category]} {categoryLabels[product.category]}
            </Badge>
            <h1 className="text-2xl font-bold">{product.title}</h1>
          </div>

          <div className="text-3xl font-bold text-orange-600">
            ${product.price.toLocaleString("es-CL")}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{product.stock} disponibles</span>
            ) : (
              <span className="text-red-500 font-medium">Agotado</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            Vendedor: <span className="font-medium text-foreground">{product.seller.name}</span>
          </div>

          {petSpecies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {petSpecies.map((sp: string) => (
                <Badge key={sp} variant="outline" className="text-xs">{sp}</Badge>
              ))}
            </div>
          )}

          {product.stock > 0 && session && (
            <AddToCartButton productId={product.id} productTitle={product.title} price={product.price} />
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descripcion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {/* More photos */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(1).map((photo: string, i: number) => (
            <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src={photo} alt={`${product.title} ${i + 2}`} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

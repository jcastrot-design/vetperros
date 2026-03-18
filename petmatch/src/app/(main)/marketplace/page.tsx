import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, PlusCircle, Package } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/validations/product";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const session = await auth();
  const { category, q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
      stock: { gt: 0 },
      ...(category ? { category } : {}),
      ...(q ? { title: { contains: q } } : {}),
    },
    include: {
      seller: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const canPublish = !!session;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-orange-500" />
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Productos para tu mascota
          </p>
        </div>
        {canPublish && (
          <Link href="/marketplace/new">
            <Button className="bg-brand hover:bg-brand-hover">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Publicar producto
            </Button>
          </Link>
        )}
      </div>

      {/* Acceso rápido mis productos */}
      {session && (
        <Link href="/marketplace/my-products">
          <div className="flex items-center gap-2 p-3 rounded-lg border hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-colors cursor-pointer w-fit">
            <Package className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Mis productos</span>
          </div>
        </Link>
      )}

      {/* Search */}
      <form className="flex gap-2 max-w-md">
        <Input
          name="q"
          placeholder="Buscar productos..."
          defaultValue={q || ""}
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button
          type="submit"
          className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-3">
        <Link href="/marketplace">
          <Badge
            variant={!category ? "default" : "outline"}
            className={`cursor-pointer px-6 py-3 text-base font-medium ${!category ? "bg-orange-500" : ""}`}
          >
            Todos
          </Badge>
        </Link>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Link key={key} href={`/marketplace?category=${key}${q ? `&q=${q}` : ""}`}>
            <Badge
              variant={category === key ? "default" : "outline"}
              className={`cursor-pointer px-6 py-3 text-base font-medium ${category === key ? "bg-orange-500" : ""}`}
            >
              {categoryIcons[key]} {label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>

      {products.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {q ? `No hay productos que coincidan con "${q}".` : "Pronto habra productos disponibles."}
          </p>
          {(category || q) && (
            <Link href="/marketplace">
              <Button variant="outline">Limpiar filtros</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          {products.map((product) => {
            const photos = parseJsonArray(product.photos);
            return (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <Card className="cursor-pointer h-full overflow-hidden hover:shadow-md transition-shadow">
                  {/* Photo */}
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {photos[0] ? (
                      <img src={photos[0]} alt={product.title} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-8xl">{categoryIcons[product.category] || "📦"}</span>
                    )}
                  </div>
                  <CardContent className="pt-5 space-y-3 p-6">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {categoryIcons[product.category]} {categoryLabels[product.category]}
                    </Badge>
                    <h3 className="font-bold text-xl line-clamp-2">{product.title}</h3>
                    {product.description && (
                      <p className="text-base text-muted-foreground line-clamp-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold text-orange-600">
                        ${product.price.toLocaleString("es-CL")}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {product.stock} disponibles
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground">
                      {product.seller.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

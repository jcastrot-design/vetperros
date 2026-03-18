"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Package } from "lucide-react";
import { categoryLabels } from "@/lib/validations/product";
import { createProduct } from "@/lib/actions/products";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("FOOD");
  const [photos, setPhotos] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createProduct({
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      price: Number(form.get("price")),
      category,
      stock: Number(form.get("stock") || 0),
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Producto enviado a revisión. Te notificaremos cuando sea aprobado.");
    router.push("/marketplace/my-products");
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Publicar Producto
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Tu producto será revisado por el equipo antes de aparecer en el Marketplace.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Nombre del producto</Label>
              <Input id="title" name="title" placeholder="Ej: Alimento premium para perros" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea id="description" name="description" placeholder="Describe el producto..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Fotos del producto</Label>
              <ImageUpload
                value={photos}
                onChange={setPhotos}
                max={4}
                folder="petmatch/products"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (CLP)</Label>
                <Input id="price" name="price" type="number" min={0} placeholder="Ej: 15000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min={0} placeholder="Ej: 10" defaultValue={1} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-brand hover:bg-brand-hover"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

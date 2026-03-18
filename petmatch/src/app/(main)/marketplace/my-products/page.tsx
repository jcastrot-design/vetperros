import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyProducts } from "@/lib/actions/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, PlusCircle, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { parseJsonArray } from "@/lib/json-arrays";

const approvalConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING_REVIEW: { label: "En revisión", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  APPROVED: { label: "Aprobado", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default async function MyProductsPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  const products = await getMyProducts();

  const pending = products.filter((p) => p.approvalStatus === "PENDING_REVIEW").length;
  const approved = products.filter((p) => p.approvalStatus === "APPROVED").length;
  const rejected = products.filter((p) => p.approvalStatus === "REJECTED").length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            Mis productos
          </h1>
          <p className="text-sm text-muted-foreground">
            {approved} aprobado{approved !== 1 ? "s" : ""} · {pending} en revisión · {rejected} rechazado{rejected !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/marketplace/new">
          <Button className="bg-brand hover:bg-brand-hover" size="sm">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium">No tienes productos publicados</p>
          <Link href="/marketplace/new">
            <Button className="bg-brand hover:bg-brand-hover mt-2">Publicar primer producto</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const photos = parseJsonArray(product.photos);
            const config = approvalConfig[product.approvalStatus];
            const StatusIcon = config.icon;

            return (
              <Card key={product.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {photos[0] ? (
                        <img src={photos[0]} alt={product.title} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 flex-shrink-0 ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="font-semibold text-orange-600">
                          ${product.price.toLocaleString("es-CL")}
                        </span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        <span className="text-muted-foreground text-xs">Stock: {product.stock}</span>
                      </div>

                      {product.approvalStatus === "REJECTED" && product.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-1.5">
                          Rechazo: {product.rejectionReason}
                        </p>
                      )}

                      {product.approvalStatus === "PENDING_REVIEW" && (
                        <p className="text-xs text-yellow-700 mt-1.5">
                          Tu producto está siendo revisado por el equipo. Te notificaremos pronto.
                        </p>
                      )}
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

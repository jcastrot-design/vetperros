import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import { parseJsonArray } from "@/lib/json-arrays";
import { ApproveRejectButtons } from "./approve-reject-buttons";

const approvalColors: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};
const approvalLabels: Record<string, string> = {
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export default async function AdminMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const { tab } = await searchParams;
  const activeTab = tab || "PENDING_REVIEW";

  const [pending, approved, rejected] = await Promise.all([
    prisma.product.count({ where: { approvalStatus: "PENDING_REVIEW" } }),
    prisma.product.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.product.count({ where: { approvalStatus: "REJECTED" } }),
  ]);

  const products = await prisma.product.findMany({
    where: { approvalStatus: activeTab },
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-orange-500" />
          Moderación Marketplace
        </h1>
        <p className="text-muted-foreground">Aprueba o rechaza productos antes de publicarlos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "PENDING_REVIEW", label: "Pendientes", count: pending, icon: Clock },
          { key: "APPROVED", label: "Aprobados", count: approved, icon: CheckCircle2 },
          { key: "REJECTED", label: "Rechazados", count: rejected, icon: XCircle },
        ].map(({ key, label, count, icon: Icon }) => (
          <a
            key={key}
            href={`/admin/marketplace?tab=${key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-orange-500 text-white border-orange-500"
                : "border-border hover:border-orange-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-white/20" : "bg-muted"}`}>
              {count}
            </span>
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No hay productos en este estado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const photos = parseJsonArray(product.photos);
            return (
              <Card key={product.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {photos[0] ? (
                        <img src={photos[0]} alt={product.title} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.seller.name} · {product.seller.email}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${approvalColors[product.approvalStatus]}`}>
                          {approvalLabels[product.approvalStatus]}
                        </span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-orange-600">
                          ${product.price.toLocaleString("es-CL")}
                        </span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        <span className="text-muted-foreground">Stock: {product.stock}</span>
                      </div>

                      {product.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Razón de rechazo: {product.rejectionReason}
                        </p>
                      )}

                      {activeTab === "PENDING_REVIEW" && (
                        <ApproveRejectButtons productId={product.id} productTitle={product.title} />
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

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { ResolveButton } from "@/components/admin/resolve-button";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      author: { select: { name: true, email: true } },
      target: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          {reports.filter((r) => !r.isResolved).length} reportes pendientes
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16">
          <Flag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay reportes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {report.author.name} reporto a {report.target.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Razon: {report.reason}
                    </p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {report.isResolved ? (
                      <Badge className="bg-green-100 text-green-700">
                        Resuelto
                      </Badge>
                    ) : (
                      <ResolveButton reportId={report.id} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

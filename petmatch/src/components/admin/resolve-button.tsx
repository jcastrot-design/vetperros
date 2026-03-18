"use client";

import { Button } from "@/components/ui/button";
import { resolveReport } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function ResolveButton({ reportId }: { reportId: string }) {
  const router = useRouter();

  async function handleResolve() {
    const result = await resolveReport(reportId);
    if (result.success) {
      toast.success("Reporte resuelto");
      router.refresh();
    }
  }

  return (
    <Button size="sm" onClick={handleResolve} className="bg-green-500 hover:bg-green-600">
      <Check className="h-3.5 w-3.5 mr-1" />
      Resolver
    </Button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, X, Award, Loader2, Trash2 } from "lucide-react";
import { verifyProvider, rejectProvider, addBadge, removeBadge } from "@/lib/actions/providers";
import { badgeTypeLabels } from "@/lib/validations/provider";
import { toast } from "sonner";

interface ProviderAdminActionsProps {
  profileId: string;
  verificationStatus: string;
  badges: { id: string; type: string }[];
}

export function ProviderAdminActions({
  profileId,
  verificationStatus,
  badges,
}: ProviderAdminActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [badgeType, setBadgeType] = useState("BACKGROUND_OK");

  async function handleVerify() {
    setLoading(true);
    const result = await verifyProvider(profileId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Proveedor verificado");
      router.refresh();
    }
  }

  async function handleReject() {
    setLoading(true);
    const result = await rejectProvider(profileId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Proveedor rechazado");
      router.refresh();
    }
  }

  async function handleAddBadge() {
    setLoading(true);
    const result = await addBadge(profileId, badgeType);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Badge agregado");
      router.refresh();
    }
  }

  async function handleRemoveBadge(badgeId: string) {
    const result = await removeBadge(badgeId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Badge eliminado");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Verification actions */}
      {verificationStatus !== "VERIFIED" && (
        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            className="bg-green-500 hover:bg-green-600"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Verificar proveedor
          </Button>
          {verificationStatus !== "REJECTED" && (
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-red-600"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Rechazar
            </Button>
          )}
        </div>
      )}

      {verificationStatus === "VERIFIED" && (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" /> Proveedor verificado
        </Badge>
      )}

      {/* Badge management */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Agregar badge</p>
        <div className="flex gap-2">
          <Select value={badgeType} onValueChange={(v) => v && setBadgeType(v)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(badgeTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleAddBadge} disabled={loading}>
            <Award className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((b) => (
              <Badge key={b.id} variant="secondary" className="pr-1">
                {badgeTypeLabels[b.type] || b.type}
                <button
                  onClick={() => handleRemoveBadge(b.id)}
                  className="ml-1.5 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gift, Copy, Users, Check, Loader2, UserPlus } from "lucide-react";
import { getMyReferralCode, getReferralStats, applyReferralCode, getReferralHistory } from "@/lib/actions/referrals";
import { toast } from "sonner";

export default function ReferralsPage() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, rewarded: 0 });
  const [history, setHistory] = useState<
    { id: string; name: string; avatarUrl: string | null; joinedAt: string; status: string }[]
  >([]);
  const [inputCode, setInputCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyReferralCode(), getReferralStats(), getReferralHistory()]).then(
      ([myCode, myStats, myHistory]) => {
        if (myCode) setCode(myCode);
        setStats(myStats);
        setHistory(myHistory);
        setLoading(false);
      },
    );
  }, []);

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for HTTP (non-HTTPS) contexts
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Codigo copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el codigo");
    }
  }

  async function handleApply() {
    if (!inputCode.trim()) return;
    setApplying(true);
    const result = await applyReferralCode(inputCode.trim().toUpperCase());
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Codigo aplicado! Gracias por unirte");
      setInputCode("");
    }
    setApplying(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-orange-500" />
          Programa de Referidos
        </h1>
        <p className="text-muted-foreground">
          Invita amigos y obtene beneficios
        </p>
      </div>

      {/* My code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu Codigo de Referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-2xl font-bold text-center tracking-widest text-orange-600">
              {code}
            </div>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="px-4"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparte este codigo con tus amigos. Cuando se registren usandolo, ambos obtendran beneficios.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Invitados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.rewarded}</p>
            <p className="text-xs text-muted-foreground">Recompensas</p>
          </CardContent>
        </Card>
      </div>

      {/* Apply code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tienes un codigo?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Ingresa el codigo"
              className="font-mono uppercase"
              maxLength={8}
            />
            <Button
              onClick={handleApply}
              disabled={applying || !inputCode.trim()}
              className="bg-brand hover:bg-brand-hover"
            >
              {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tus Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aun no tienes referidos. Comparte tu codigo para empezar!
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Avatar>
                    {referral.avatarUrl ? (
                      <AvatarImage src={referral.avatarUrl} alt={referral.name} />
                    ) : null}
                    <AvatarFallback>
                      {referral.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Se unio el{" "}
                      {new Date(referral.joinedAt).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    className={
                      referral.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : referral.status === "REWARDED"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                    }
                  >
                    {referral.status === "COMPLETED"
                      ? "Completado"
                      : referral.status === "REWARDED"
                        ? "Recompensado"
                        : "Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Como funciona?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge className="bg-orange-500 shrink-0">1</Badge>
              <p>Comparte tu codigo con amigos que tengan mascotas</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-orange-500 shrink-0">2</Badge>
              <p>Tu amigo se registra y aplica tu codigo</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-orange-500 shrink-0">3</Badge>
              <p>Ambos reciben beneficios en su proxima reserva</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

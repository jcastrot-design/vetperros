"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      if (result.devResetUrl) {
        setDevResetUrl(result.devResetUrl);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <PawPrint className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-500">PetMatch</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Recuperar Contrasena</CardTitle>
          <CardDescription>
            Te enviaremos un enlace para restablecer tu contrasena
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Si existe una cuenta con ese email, recibiras un enlace de recuperacion.
              </p>

              {devResetUrl && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Modo desarrollo
                  </div>
                  <p className="text-xs text-yellow-700">
                    En produccion este link se enviaria por email:
                  </p>
                  <Link
                    href={devResetUrl}
                    className="block text-sm text-orange-600 hover:underline font-medium break-all"
                  >
                    {devResetUrl}
                  </Link>
                </div>
              )}

              <Link href="/signin">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar enlace de recuperacion
              </Button>
              <Link href="/signin" className="block text-center text-sm text-primary hover:underline">
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Volver
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

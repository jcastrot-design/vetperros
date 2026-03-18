"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { providerTypeLabels, docTypeLabels } from "@/lib/validations/provider";
import { createProviderProfile, uploadProviderDocument, getProviderProfile } from "@/lib/actions/providers";
import { FileUpload } from "@/components/shared/file-upload";
import { toast } from "sonner";

const steps = ["Datos basicos", "Experiencia", "Documentos"];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);

  // Step 1
  const [type, setType] = useState("WALKER");
  const [displayName, setDisplayName] = useState("");
  const [coverageRadius, setCoverageRadius] = useState(10);

  // Step 2
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);

  // Step 3
  const [docType, setDocType] = useState("ID_CARD");
  const [docUrl, setDocUrl] = useState("");
  const [docs, setDocs] = useState<{ type: string; url: string }[]>([]);

  // Check if profile already exists
  useEffect(() => {
    getProviderProfile().then((profile) => {
      if (profile) {
        router.replace("/provider");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  async function handleCreateProfile() {
    setLoading(true);
    const result = await createProviderProfile({
      type,
      displayName,
      bio: bio || undefined,
      experience,
      coverageRadius,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return false;
    }
    setProfileCreated(true);
    toast.success("Perfil creado");
    return true;
  }

  async function handleAddDoc() {
    if (!docUrl.trim()) return;
    setLoading(true);
    const result = await uploadProviderDocument({
      type: docType,
      fileUrl: docUrl,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setDocs((prev) => [...prev, { type: docType, url: docUrl }]);
      setDocUrl("");
      toast.success("Documento subido");
    }
  }

  async function handleNext() {
    // Validate step 1
    if (step === 0 && !displayName.trim()) {
      toast.error("Ingresa un nombre para mostrar");
      return;
    }

    // Validate step 2 and create profile
    if (step === 1) {
      if (bio.trim().length < 10) {
        toast.error("La biografia debe tener al menos 10 caracteres");
        return;
      }
      const ok = await handleCreateProfile();
      if (!ok) return;
    }
    setStep((s) => s + 1);
  }

  function handleFinish() {
    toast.success("Onboarding completado! Tu perfil sera revisado pronto.");
    router.push("/provider");
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurar perfil de proveedor</h1>
        <p className="text-muted-foreground">
          Paso {step + 1} de {steps.length}: {steps[step]}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i <= step ? "bg-orange-500" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Basic info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos basicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de servicio principal *</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providerTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre para mostrar *</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Carlos Paseador"
              />
            </div>

            <div className="space-y-2">
              <Label>Radio de cobertura (km)</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={coverageRadius}
                onChange={(e) => setCoverageRadius(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Experience */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Experiencia y presentacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Biografia * (minimo 10 caracteres)</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuentale a los duenos sobre ti, tu experiencia con mascotas..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/10 caracteres minimos
              </p>
            </div>

            <div className="space-y-2">
              <Label>Anos de experiencia</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                placeholder="Ej: 3"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos de verificacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sube documentos para verificar tu identidad y generar confianza.
              Seran revisados por nuestro equipo.
            </p>

            {type === "VET" && (
              <div className="p-3 border rounded-lg bg-blue-50 text-sm text-blue-800 space-y-1">
                <p className="font-medium">Requisito para veterinarios</p>
                <p>Debes subir tu titulo profesional (tipo &quot;Certificacion&quot;) para poder publicar servicios a domicilio. Sera revisado por nuestro equipo.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={docType} onValueChange={(v) => v && setDocType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(docTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Documento</Label>
              <FileUpload
                value={docUrl}
                onChange={(url) => setDocUrl(url)}
                accept="image/*,.pdf"
                label="Seleccionar archivo"
              />
              {docUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDoc}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar documento"}
                </Button>
              )}
            </div>

            {docs.length > 0 && (
              <div className="space-y-2">
                <Label>Documentos subidos</Label>
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{docTypeLabels[d.type]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Atras
          </Button>
        ) : (
          <div />
        )}

        {step < steps.length - 1 ? (
          <Button
            className="bg-brand hover:bg-brand-hover"
            onClick={handleNext}
            disabled={loading || (step === 0 && !displayName.trim())}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Siguiente
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="bg-brand hover:bg-brand-hover"
            onClick={handleFinish}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Finalizar
          </Button>
        )}
      </div>
    </div>
  );
}

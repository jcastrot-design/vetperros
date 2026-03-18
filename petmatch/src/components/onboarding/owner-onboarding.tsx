"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PawPrint, ChevronRight, ChevronLeft, Check, Sparkles, Heart,
  Search, PartyPopper,
} from "lucide-react";
import { createPet } from "@/lib/actions/pets";
import { petSpeciesLabels, petSizeLabels, temperamentOptions } from "@/lib/validations/pet";
import { toast } from "sonner";

type Step = "welcome" | "pet" | "interests" | "done";
type Interest = "services" | "match" | "vet";

const interestRoutes: Record<Interest, { href: string; label: string }> = {
  services: { href: "/services", label: "Buscar servicios" },
  match: { href: "/match", label: "Ir a PetMatch" },
  vet: { href: "/vet-home", label: "Ver veterinarios" },
};

export function OwnerOnboarding({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState<Interest | null>(null);

  // Pet form state
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [size, setSize] = useState("MEDIUM");
  const [energyLevel, setEnergyLevel] = useState("MEDIUM");
  const [breed, setBreed] = useState("");
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>([]);

  function toggleTemperament(t: string) {
    setSelectedTemperaments((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function handleCreatePet() {
    if (!petName.trim()) {
      toast.error("Dale un nombre a tu mascota");
      return;
    }
    setLoading(true);
    const result = await createPet({
      name: petName.trim(),
      species,
      size,
      energyLevel,
      breed: breed || undefined,
      temperament: JSON.stringify(selectedTemperaments),
      isVaccinated: false,
      isNeutered: false,
      photos: "[]",
      allergies: "[]",
      medicalConditions: "[]",
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${petName} registrado!`);
    setStep("interests");
  }

  function handleSkipPet() {
    setStep("interests");
  }

  function handleFinish() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(["welcome", "pet", "interests", "done"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full transition-colors ${
                  step === s ? "bg-orange-500 scale-125" :
                  (["welcome", "pet", "interests", "done"].indexOf(step) > i)
                    ? "bg-orange-300" : "bg-muted"
                }`}
              />
              {i < 3 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === "welcome" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bienvenido, {userName}!</h1>
                <p className="text-muted-foreground mt-2">
                  Vamos a configurar tu cuenta en PetMatch en menos de un minuto.
                </p>
              </div>
              <div className="grid gap-3 text-left text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                  <PawPrint className="h-5 w-5 text-orange-500 shrink-0" />
                  <span>Registra a tu mascota</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50">
                  <Heart className="h-5 w-5 text-pink-500 shrink-0" />
                  <span>Encuentra amigos con PetMatch</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <Search className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Busca servicios para tu mascota</span>
                </div>
              </div>
              <Button
                onClick={() => setStep("pet")}
                className="w-full bg-brand hover:bg-brand-hover"
                size="lg"
              >
                Comenzar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Register Pet */}
        {step === "pet" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-orange-500" />
                Registra tu primera mascota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Max, Luna, Rocky..."
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Especie</Label>
                  <Select value={species} onValueChange={(v) => v && setSpecies(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(petSpeciesLabels).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamano</Label>
                  <Select value={size} onValueChange={(v) => v && setSize(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(petSizeLabels).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Raza (opcional)</Label>
                <Input
                  placeholder="Ej: Labrador, Siames..."
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Personalidad</Label>
                <div className="flex flex-wrap gap-2">
                  {temperamentOptions.map((t) => (
                    <Badge
                      key={t}
                      variant={selectedTemperaments.includes(t) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTemperaments.includes(t) ? "bg-orange-500" : ""
                      }`}
                      onClick={() => toggleTemperament(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("welcome")}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Atras
                </Button>
                <Button
                  onClick={handleCreatePet}
                  className="flex-1 bg-brand hover:bg-brand-hover"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar mascota"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <button
                onClick={handleSkipPet}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                Omitir por ahora
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step: Interests */}
        {step === "interests" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Que te interesa?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona lo que quieres explorar primero:
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => { setInterest("services"); setStep("done"); }}
                  className="p-4 rounded-lg border hover:border-orange-300 hover:bg-orange-50 transition-colors text-left flex items-center gap-3"
                >
                  <Search className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="font-medium">Buscar paseadores o cuidadores</p>
                    <p className="text-xs text-muted-foreground">Encuentra servicios cerca de ti</p>
                  </div>
                </button>
                <button
                  onClick={() => { setInterest("match"); setStep("done"); }}
                  className="p-4 rounded-lg border hover:border-pink-300 hover:bg-pink-50 transition-colors text-left flex items-center gap-3"
                >
                  <Heart className="h-6 w-6 text-pink-500" />
                  <div>
                    <p className="font-medium">PetMatch — amigos para mi mascota</p>
                    <p className="text-xs text-muted-foreground">Conecta con otros duenos</p>
                  </div>
                </button>
                <button
                  onClick={() => { setInterest("vet"); setStep("done"); }}
                  className="p-4 rounded-lg border hover:border-green-300 hover:bg-green-50 transition-colors text-left flex items-center gap-3"
                >
                  <PawPrint className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Veterinario a domicilio</p>
                    <p className="text-xs text-muted-foreground">Consultas, vacunas y urgencias</p>
                  </div>
                </button>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep("pet")}
                className="w-full"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Atras
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Todo listo!</h1>
                <p className="text-muted-foreground mt-2">
                  Tu cuenta esta configurada. Explora PetMatch y descubre todo lo que puedes hacer.
                </p>
              </div>
              <div className="space-y-3">
                {interest && (
                  <Button
                    onClick={() => { router.push(interestRoutes[interest].href); router.refresh(); }}
                    className="w-full bg-brand hover:bg-brand-hover"
                    size="lg"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    {interestRoutes[interest].label}
                  </Button>
                )}
                <Button
                  onClick={handleFinish}
                  variant={interest ? "outline" : "default"}
                  className={interest ? "w-full" : "w-full bg-brand hover:bg-brand-hover"}
                  size="lg"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Ir a mi panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

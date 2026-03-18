"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, HeartHandshake } from "lucide-react";
import { applyToAdopt } from "@/lib/actions/adoptions";
import { housingLabels } from "@/lib/validations/adoption";
import { toast } from "sonner";

interface ApplyButtonProps {
  postId: string;
  petName: string;
}

export function ApplyButton({ postId, petName }: ApplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [housing, setHousing] = useState<string>("");
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const result = await applyToAdopt({
      postId,
      message: form.get("message") as string,
      housingSituation: housing || undefined,
      hasYard: (form.get("hasYard") as string) === "on",
      hasOtherPets,
      otherPetsInfo: hasOtherPets ? (form.get("otherPetsInfo") as string) : undefined,
      hasChildren,
      childrenAges: hasChildren ? (form.get("childrenAges") as string) : undefined,
      workSchedule: form.get("workSchedule") as string || undefined,
      experience: form.get("experience") as string || undefined,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("¡Solicitud enviada! El dueño te contactará pronto.");
    setOpen(false);
  }

  return (
    <>
      <Button
        className="w-full bg-rose-500 hover:bg-rose-600"
        onClick={() => setOpen(true)}
      >
        <HeartHandshake className="h-4 w-4 mr-2" />
        Solicitar adopción de {petName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar adopción</DialogTitle>
            <DialogDescription>
              Cuéntale al dueño por qué serías el hogar perfecto para {petName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                ¿Por qué quieres adoptar a {petName}? <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder={`Preséntate y cuéntale al dueño por qué ${petName} estaría bien contigo...`}
                rows={4}
                required
                minLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de vivienda</Label>
                <Select value={housing} onValueChange={setHousing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(housingLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workSchedule">Horario de trabajo</Label>
                <Input id="workSchedule" name="workSchedule" placeholder="Ej: Trabajo desde casa" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="hasYard" name="hasYard" />
              <Label htmlFor="hasYard">Tengo patio o jardín</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasOtherPets"
                  checked={hasOtherPets}
                  onCheckedChange={(v) => setHasOtherPets(v === true)}
                />
                <Label htmlFor="hasOtherPets">Tengo otras mascotas</Label>
              </div>
              {hasOtherPets && (
                <Input
                  name="otherPetsInfo"
                  placeholder="Ej: 1 gato adulto castrado, muy tranquilo"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasChildren"
                  checked={hasChildren}
                  onCheckedChange={(v) => setHasChildren(v === true)}
                />
                <Label htmlFor="hasChildren">Hay niños en el hogar</Label>
              </div>
              {hasChildren && (
                <Input
                  name="childrenAges"
                  placeholder="Ej: 7 y 10 años"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experiencia previa con mascotas</Label>
              <Textarea
                id="experience"
                name="experience"
                placeholder="Ej: Tuve perros toda mi vida, tengo experiencia con labradores..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar solicitud
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

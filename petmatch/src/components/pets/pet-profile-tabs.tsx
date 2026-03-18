"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PawPrint, Pencil, Syringe, Pill, FileText, Bell,
  Calendar, Ruler, Zap, Heart, Weight, Stethoscope, Shield,
} from "lucide-react";
import Link from "next/link";
import { petSpeciesLabels, petSizeLabels, energyLabels, petSexLabels } from "@/lib/validations/pet";
import { parseJsonArray } from "@/lib/json-arrays";
import { VaccineList } from "./vaccine-list";
import { MedicationList } from "./medication-list";
import { DocumentList } from "./document-list";
import { ReminderList } from "./reminder-list";
import { SharePetButton } from "./share-pet-button";
import { MedicalVisitList } from "./medical-visit-list";
import type { Pet, PetVaccine, PetMedication, PetDocument, Reminder, MedicalVisit } from "@/generated/prisma/client";

interface PetProfileTabsProps {
  pet: Pet & {
    vaccines: PetVaccine[];
    medications: PetMedication[];
    documents: PetDocument[];
    reminders: Reminder[];
    medicalVisits: MedicalVisit[];
  };
  hasActiveInsurance?: boolean;
}

export function PetProfileTabs({ pet, hasActiveInsurance }: PetProfileTabsProps) {
  const photos = parseJsonArray(pet.photos);
  const temperament = parseJsonArray(pet.temperament);
  const allergies = parseJsonArray(pet.allergies);
  const medicalConditions = parseJsonArray(pet.medicalConditions);

  const age = pet.dateOfBirth
    ? Math.floor((Date.now() - new Date(pet.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : pet.age;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center overflow-hidden">
            {photos[0] ? (
              <img src={photos[0]} alt={pet.name} className="object-cover w-full h-full" />
            ) : (
              <PawPrint className="h-10 w-10 text-orange-300" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">
              {pet.breed || petSpeciesLabels[pet.species]}
              {age ? ` · ${age < 12 ? `${age} meses` : `${Math.floor(age / 12)} anos`}` : ""}
              {pet.weight ? ` · ${pet.weight} kg` : ""}
            </p>
            <div className="flex gap-1.5 mt-1">
              <Badge variant="secondary">{petSpeciesLabels[pet.species]}</Badge>
              {pet.sex && <Badge variant="secondary">{petSexLabels[pet.sex]}</Badge>}
              <Badge variant="secondary">{petSizeLabels[pet.size]}</Badge>
              {pet.isVaccinated && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Vacunado</Badge>
              )}
              {pet.isNeutered && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Esterilizado</Badge>
              )}
              {hasActiveInsurance && (
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Asegurado
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/pet/${pet.id}`} target="_blank">
            <Button variant="outline" size="sm" className="text-orange-600">
              <PawPrint className="h-4 w-4 mr-1.5" />
              Pasaporte
            </Button>
          </Link>
          <SharePetButton pet={pet} />
          <Link href={`/dashboard/pets/${pet.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1.5" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile completion */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Perfil completado</span>
            <span className="text-sm text-muted-foreground">{pet.profileCompletion}%</span>
          </div>
          <Progress value={pet.profileCompletion} className="h-2" />
          {pet.profileCompletion < 80 && (
            <p className="text-xs text-muted-foreground mt-2">
              Completa el perfil de {pet.name} para mejores recomendaciones de servicios y productos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info" className="text-xs sm:text-sm">
            <PawPrint className="h-4 w-4 mr-1 hidden sm:inline" />
            Info
          </TabsTrigger>
          <TabsTrigger value="vaccines" className="text-xs sm:text-sm">
            <Syringe className="h-4 w-4 mr-1 hidden sm:inline" />
            Vacunas
            {pet.vaccines.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{pet.vaccines.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="medications" className="text-xs sm:text-sm">
            <Pill className="h-4 w-4 mr-1 hidden sm:inline" />
            Medicamentos
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">
            <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
            Docs
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1 hidden sm:inline" />
            Recordatorios
            {pet.reminders.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{pet.reminders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="medical" className="text-xs sm:text-sm">
            <Stethoscope className="h-4 w-4 mr-1 hidden sm:inline" />
            Historial
            {pet.medicalVisits.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{pet.medicalVisits.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacion general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {pet.breed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Raza</p>
                    <p className="font-medium">{pet.breed}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Nivel de energia</p>
                  <p className="font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4" /> {energyLabels[pet.energyLevel]}
                  </p>
                </div>
                {pet.weight && (
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">{pet.weight} kg</p>
                  </div>
                )}
                {pet.microchipId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Microchip</p>
                    <p className="font-medium font-mono text-sm">{pet.microchipId}</p>
                  </div>
                )}
                {pet.diet && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Dieta</p>
                    <p className="font-medium">{pet.diet}</p>
                  </div>
                )}
              </div>

              {temperament.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Temperamento</p>
                  <div className="flex flex-wrap gap-1.5">
                    {temperament.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alergias</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((a) => (
                      <Badge key={a} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {medicalConditions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Condiciones medicas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {medicalConditions.map((c) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {pet.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripcion</p>
                  <p>{pet.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccines tab */}
        <TabsContent value="vaccines">
          <VaccineList petId={pet.id} vaccines={pet.vaccines} />
        </TabsContent>

        {/* Medications tab */}
        <TabsContent value="medications">
          <MedicationList petId={pet.id} medications={pet.medications} />
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents">
          <DocumentList petId={pet.id} documents={pet.documents} />
        </TabsContent>

        {/* Reminders tab */}
        <TabsContent value="reminders">
          <ReminderList petId={pet.id} reminders={pet.reminders} />
        </TabsContent>

        {/* Medical history tab */}
        <TabsContent value="medical">
          <MedicalVisitList petId={pet.id} visits={pet.medicalVisits} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

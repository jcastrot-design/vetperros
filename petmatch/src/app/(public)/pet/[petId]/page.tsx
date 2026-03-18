import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Shield, Syringe, Heart, AlertTriangle, Phone, Stethoscope } from "lucide-react";
import { parseJsonArray } from "@/lib/json-arrays";
import { PassportActions } from "./passport-actions";

const speciesEmoji: Record<string, string> = {
  DOG: "🐕", CAT: "🐈", BIRD: "🐦", RABBIT: "🐇", OTHER: "🐾",
};

const sizeLabels: Record<string, string> = {
  TINY: "Muy pequeno", SMALL: "Pequeno", MEDIUM: "Mediano", LARGE: "Grande", GIANT: "Gigante",
};

export default async function PetPassportPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      owner: { select: { name: true, phone: true, city: true } },
      vaccines: {
        orderBy: { dateAdministered: "desc" },
        take: 10,
      },
      medicalVisits: {
        orderBy: { visitDate: "desc" },
        take: 5,
      },
    },
  });

  if (!pet) notFound();

  const allergies = parseJsonArray(pet.allergies);
  const medicalConditions = parseJsonArray(pet.medicalConditions);
  const photos = parseJsonArray(pet.photos);
  const passportUrl = `${process.env.NEXTAUTH_URL || "https://petmatch.cl"}/pet/${pet.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(passportUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white print:bg-white print:min-h-0">
      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border-width: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-md mx-auto p-4 space-y-4 print:p-0 print:max-w-none">
        {/* Header */}
        <div className="text-center pt-6 pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PawPrint className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold text-orange-500">PetMatch</span>
          </div>
          <h1 className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Pasaporte de Mascota
          </h1>
        </div>

        {/* Action buttons */}
        <PassportActions />

        {/* Main card */}
        <Card className="border-2 border-orange-200 overflow-hidden print:shadow-none print:border-0">
          {/* Photo + Name header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white text-center">
            {photos.length > 0 ? (
              <img
                src={photos[0]}
                alt={pet.name}
                className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-white mb-3"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">{speciesEmoji[pet.species] || "🐾"}</span>
              </div>
            )}
            <h2 className="text-2xl font-bold">{pet.name}</h2>
            <p className="text-orange-100">
              {pet.breed || pet.species} {pet.sex === "MALE" ? "♂" : pet.sex === "FEMALE" ? "♀" : ""}
            </p>
          </div>

          <CardContent className="pt-4 space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {pet.age && (
                <div>
                  <p className="text-muted-foreground text-xs">Edad</p>
                  <p className="font-medium">
                    {pet.age >= 12 ? `${Math.floor(pet.age / 12)} anos` : `${pet.age} meses`}
                  </p>
                </div>
              )}
              {pet.weight && (
                <div>
                  <p className="text-muted-foreground text-xs">Peso</p>
                  <p className="font-medium">{pet.weight} kg</p>
                </div>
              )}
              {pet.size && (
                <div>
                  <p className="text-muted-foreground text-xs">Tamano</p>
                  <p className="font-medium">{sizeLabels[pet.size] || pet.size}</p>
                </div>
              )}
              {pet.microchipId && (
                <div>
                  <p className="text-muted-foreground text-xs">Microchip</p>
                  <p className="font-medium font-mono text-xs">{pet.microchipId}</p>
                </div>
              )}
            </div>

            {/* Health status */}
            <div className="flex gap-2">
              {pet.isVaccinated && (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <Syringe className="h-3 w-3" />
                  Vacunado
                </Badge>
              )}
              {pet.isNeutered && (
                <Badge className="bg-blue-100 text-blue-700 gap-1">
                  <Shield className="h-3 w-3" />
                  Esterilizado
                </Badge>
              )}
            </div>

            {/* Allergies */}
            {allergies.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  Alergias
                </p>
                <div className="flex flex-wrap gap-1">
                  {allergies.map((a: string) => (
                    <Badge key={a} variant="destructive" className="text-xs">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical conditions */}
            {medicalConditions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                  <Heart className="h-3 w-3 text-orange-500" />
                  Condiciones medicas
                </p>
                <div className="flex flex-wrap gap-1">
                  {medicalConditions.map((c: string) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Vaccines */}
            {pet.vaccines.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                  <Syringe className="h-3 w-3 text-green-500" />
                  Vacunas recientes
                </p>
                <div className="space-y-1">
                  {pet.vaccines.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex justify-between text-xs border-b last:border-0 py-1">
                      <span className="font-medium">{v.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(v.dateAdministered).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical visits */}
            {pet.medicalVisits.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                  <Stethoscope className="h-3 w-3 text-blue-500" />
                  Historial medico reciente
                </p>
                <div className="space-y-1">
                  {pet.medicalVisits.map((v) => (
                    <div key={v.id} className="flex justify-between text-xs border-b last:border-0 py-1">
                      <span className="font-medium">{v.title}</span>
                      <span className="text-muted-foreground">
                        {new Date(v.visitDate).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner contact */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Dueno/a</p>
              <p className="text-sm font-medium">{pet.owner.name}</p>
              {pet.owner.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {pet.owner.phone}
                </p>
              )}
              {pet.owner.city && (
                <p className="text-xs text-muted-foreground">{pet.owner.city}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="text-center border-t pt-4">
              <img
                src={qrUrl}
                alt="QR Code"
                className="mx-auto"
                width={150}
                height={150}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Escanea para ver este pasaporte
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-4 print:hidden">
          PetMatch - Pasaporte Digital de Mascotas
        </p>
      </div>
    </div>
  );
}

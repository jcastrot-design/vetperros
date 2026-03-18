import { z } from "zod/v4";

export const adoptionPostSchema = z.object({
  petId: z.string().min(1, "Selecciona una mascota"),
  reason: z.enum(["MOVING", "ALLERGY", "TIME", "FINANCIAL", "FOUND_STRAY", "RESCUE", "OTHER"]),
  adoptionFee: z.number().min(0).default(0),
  city: z.string().optional(),
  isUrgent: z.boolean().default(false),
  isFosterOnly: z.boolean().default(false),
  description: z.string().optional(),
  requirements: z.string().default("[]"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]).default("ACTIVE"),
});

export const adoptionApplicationSchema = z.object({
  postId: z.string().min(1),
  message: z.string().min(20, "Escribe al menos 20 caracteres presentándote"),
  housingSituation: z.enum(["HOUSE", "APARTMENT", "FARM", "OTHER"]).optional(),
  hasYard: z.boolean().optional(),
  hasOtherPets: z.boolean().optional(),
  otherPetsInfo: z.string().optional(),
  hasChildren: z.boolean().optional(),
  childrenAges: z.string().optional(),
  workSchedule: z.string().optional(),
  experience: z.string().optional(),
});

export const reasonLabels: Record<string, string> = {
  MOVING:      "Mudanza",
  ALLERGY:     "Alergia",
  TIME:        "Falta de tiempo",
  FINANCIAL:   "Razones económicas",
  FOUND_STRAY: "Animal rescatado / encontrado",
  RESCUE:      "Rescate",
  OTHER:       "Otro motivo",
};

export const postStatusLabels: Record<string, string> = {
  DRAFT:     "Borrador",
  ACTIVE:    "Activa",
  PAUSED:    "Pausada",
  ADOPTED:   "Adoptada",
  CANCELLED: "Cancelada",
};

export const postStatusColors: Record<string, string> = {
  DRAFT:     "secondary",
  ACTIVE:    "default",
  PAUSED:    "outline",
  ADOPTED:   "default",
  CANCELLED: "destructive",
};

export const applicationStatusLabels: Record<string, string> = {
  PENDING:   "Pendiente",
  REVIEWED:  "En revisión",
  APPROVED:  "Aprobada",
  REJECTED:  "No seleccionada",
  WITHDRAWN: "Retirada",
};

export const applicationStatusColors: Record<string, string> = {
  PENDING:   "secondary",
  REVIEWED:  "outline",
  APPROVED:  "default",
  REJECTED:  "destructive",
  WITHDRAWN: "outline",
};

export const housingLabels: Record<string, string> = {
  HOUSE:     "Casa",
  APARTMENT: "Departamento",
  FARM:      "Campo / Parcela",
  OTHER:     "Otro",
};

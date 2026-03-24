import { z } from "zod/v4";

export const serviceSchema = z.object({
  type: z.enum(["WALK", "SITTING", "DAYCARE", "BOARDING", "GROOMING", "VET_HOME", "TELECONSULTA", "TRAINING"]),
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  pricePerUnit: z.number().min(0, "El precio debe ser positivo"),
  city: z.string().optional(),
  radiusKm: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceTypeLabels: Record<string, string> = {
  WALK: "Paseo",
  SITTING: "Cuidado por horas",
  DAYCARE: "Guardería",
  BOARDING: "Hospedaje",
  GROOMING: "Grooming",
  VET_HOME: "Veterinario a domicilio",
  TELECONSULTA: "Teleconsulta",
  TRAINING: "Adiestramiento",
};

export const serviceTypeIcons: Record<string, string> = {
  WALK: "🐕",
  SITTING: "🏠",
  DAYCARE: "☀️",
  BOARDING: "🛏️",
  GROOMING: "✂️",
  VET_HOME: "🩺",
  TELECONSULTA: "💻",
  TRAINING: "🎓",
};

export const bookingStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

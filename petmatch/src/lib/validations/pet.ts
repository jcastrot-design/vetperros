import { z } from "zod/v4";

export const petSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  species: z.enum(["DOG", "CAT"]),
  breed: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  temperament: z.string().default("[]"), // JSON array
  age: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  isVaccinated: z.boolean().default(false),
  isNeutered: z.boolean().default(false),
  microchipId: z.string().optional(),
  allergies: z.string().default("[]"), // JSON array
  medicalConditions: z.string().default("[]"), // JSON array
  diet: z.string().optional(),
  description: z.string().optional(),
  photos: z.string().default("[]"), // JSON array
});

export type PetInput = z.infer<typeof petSchema>;

export const vaccineSchema = z.object({
  petId: z.string(),
  name: z.string().min(1, "El nombre de la vacuna es requerido"),
  dateAdministered: z.string().min(1, "La fecha es requerida"), // ISO date
  nextDueDate: z.string().optional(),
  veterinarian: z.string().optional(),
  notes: z.string().optional(),
});

export type VaccineInput = z.infer<typeof vaccineSchema>;

export const medicationSchema = z.object({
  petId: z.string(),
  name: z.string().min(1, "El nombre del medicamento es requerido"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

export const documentSchema = z.object({
  petId: z.string(),
  type: z.enum(["MEDICAL_RECORD", "VACCINATION_CARD", "PRESCRIPTION", "INSURANCE", "OTHER"]),
  title: z.string().min(1, "El titulo es requerido"),
  fileUrl: z.string().min(1, "La URL del archivo es requerida"),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export const reminderSchema = z.object({
  petId: z.string(),
  type: z.enum(["VACCINE", "DEWORMING", "MEDICATION", "GROOMING", "CHECKUP", "CUSTOM"]),
  title: z.string().min(1, "El titulo es requerido"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "La fecha es requerida"), // ISO date
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "BIANNUAL", "ANNUAL"]).default("NONE"),
  notifyBefore: z.number().int().min(0).default(3),
});

export type ReminderInput = z.infer<typeof reminderSchema>;

// Labels

export const petSpeciesLabels: Record<string, string> = {
  DOG: "Perro",
  CAT: "Gato",
};

export const petSizeLabels: Record<string, string> = {
  SMALL: "Pequeno",
  MEDIUM: "Mediano",
  LARGE: "Grande",
  XLARGE: "Muy grande",
};

export const petSexLabels: Record<string, string> = {
  MALE: "Macho",
  FEMALE: "Hembra",
};

export const energyLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export const temperamentOptions = [
  "Amigable",
  "Jugueton",
  "Tranquilo",
  "Timido",
  "Protector",
  "Independiente",
  "Sociable",
  "Energetico",
  "Obediente",
  "Curioso",
];

export const documentTypeLabels: Record<string, string> = {
  MEDICAL_RECORD: "Historia clinica",
  VACCINATION_CARD: "Carnet de vacunas",
  PRESCRIPTION: "Receta medica",
  INSURANCE: "Seguro",
  OTHER: "Otro",
};

export const reminderTypeLabels: Record<string, string> = {
  VACCINE: "Vacuna",
  DEWORMING: "Desparasitacion",
  MEDICATION: "Medicamento",
  GROOMING: "Grooming",
  CHECKUP: "Chequeo veterinario",
  CUSTOM: "Personalizado",
};

export const recurrenceLabels: Record<string, string> = {
  NONE: "Sin repeticion",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  BIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

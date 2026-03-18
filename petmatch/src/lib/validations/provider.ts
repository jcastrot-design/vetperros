import { z } from "zod/v4";

export const providerProfileSchema = z.object({
  type: z.enum(["WALKER", "SITTER", "GROOMER", "BOARDING", "VET"]),
  displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().min(10, "La biografia debe tener al menos 10 caracteres").optional(),
  experience: z.number().int().min(0).default(0), // years
  coverageRadius: z.number().min(1).max(50).default(10),
  certifications: z.string().default("[]"), // JSON array
  photos: z.string().default("[]"), // JSON array
});

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;

export const providerDocumentSchema = z.object({
  type: z.enum(["ID_CARD", "BACKGROUND_CHECK", "CERTIFICATION", "SPACE_PHOTO"]),
  fileUrl: z.string().min(1, "La URL del archivo es requerida"),
});

export type ProviderDocumentInput = z.infer<typeof providerDocumentSchema>;

// Labels

export const providerTypeLabels: Record<string, string> = {
  WALKER: "Paseador",
  SITTER: "Cuidador",
  GROOMER: "Groomer",
  BOARDING: "Hospedaje",
  VET: "Veterinario",
};

export const docTypeLabels: Record<string, string> = {
  ID_CARD: "Documento de identidad",
  BACKGROUND_CHECK: "Certificado de antecedentes",
  CERTIFICATION: "Certificacion profesional",
  SPACE_PHOTO: "Foto del espacio",
};

export const docStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export const badgeTypeLabels: Record<string, string> = {
  IDENTITY_VERIFIED: "Identidad verificada",
  BACKGROUND_OK: "Antecedentes OK",
  SUPER_PROVIDER: "Super proveedor",
  SPACE_VERIFIED: "Espacio verificado",
  CERTIFIED: "Certificado",
  FOUNDER: "Fundador",
};

export const badgeTypeIcons: Record<string, string> = {
  IDENTITY_VERIFIED: "shield-check",
  BACKGROUND_OK: "file-check",
  SUPER_PROVIDER: "star",
  SPACE_VERIFIED: "home",
  CERTIFIED: "award",
  FOUNDER: "gem",
};

export const verificationStatusLabels: Record<string, string> = {
  NONE: "Sin verificar",
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
};

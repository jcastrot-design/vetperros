import { z } from "zod/v4";

export const productSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser positivo"),
  category: z.enum(["FOOD", "TREATS", "TOYS", "ACCESSORIES", "HEALTH", "GROOMING", "OTHER"]),
  stock: z.number().int().min(0).default(0),
  photos: z.string().optional(),
  petSpecies: z.string().optional(),
});

export const categoryLabels: Record<string, string> = {
  FOOD: "Alimento",
  TREATS: "Snacks",
  TOYS: "Juguetes",
  ACCESSORIES: "Accesorios",
  HEALTH: "Salud",
  GROOMING: "Higiene",
  OTHER: "Otros",
};

export const categoryIcons: Record<string, string> = {
  FOOD: "🍖",
  TREATS: "🦴",
  TOYS: "🎾",
  ACCESSORIES: "🎀",
  HEALTH: "💊",
  GROOMING: "🧴",
  OTHER: "📦",
};

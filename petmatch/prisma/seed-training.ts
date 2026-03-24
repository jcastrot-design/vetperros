/**
 * Script para agregar escuelas de adiestramiento a la BD existente.
 * Ejecutar una sola vez: ./node_modules/.bin/tsx prisma/seed-training.ts
 */
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Skip if training schools already exist
  const exists = await prisma.user.findFirst({ where: { email: "contacto@k9chile.cl" } });
  if (exists) {
    console.log("Training schools already seeded, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 12);

  const escuelaK9 = await prisma.user.create({
    data: { email: "contacto@k9chile.cl", name: "K9 Chile", passwordHash, role: "WALKER", city: "Santiago" },
  });
  const escuelaCanina = await prisma.user.create({
    data: { email: "info@escuelacanina.cl", name: "Escuela Canina Profesional", passwordHash, role: "WALKER", city: "Providencia" },
  });
  const dogMaster = await prisma.user.create({
    data: { email: "hola@dogmaster.cl", name: "Dog Master Chile", passwordHash, role: "WALKER", city: "Las Condes" },
  });

  const k9Profile = await prisma.providerProfile.create({
    data: {
      userId: escuelaK9.id,
      type: "WALKER",
      displayName: "K9 Chile — Adiestramiento Profesional",
      bio: "Centro de adiestramiento canino profesional con más de 10 años en el mercado. Entrenadores certificados por la Asociación Chilena de Adiestramiento. Trabajamos con todas las razas y edades.",
      experience: 10,
      certifications: JSON.stringify(["Certificación IACP", "Adiestramiento en positivo", "Agility avanzado"]),
      photos: JSON.stringify([]),
      coverageRadius: 20,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.9,
      totalServices: 312,
      averageRating: 4.9,
      responseTime: 20,
      acceptanceRate: 88,
      isActive: true,
    },
  });
  await prisma.providerBadge.createMany({
    data: [
      { providerId: k9Profile.id, type: "IDENTITY_VERIFIED" },
      { providerId: k9Profile.id, type: "BACKGROUND_OK" },
      { providerId: k9Profile.id, type: "SUPER_PROVIDER" },
      { providerId: k9Profile.id, type: "CERTIFIED" },
    ],
  });

  const escuelaProfile = await prisma.providerProfile.create({
    data: {
      userId: escuelaCanina.id,
      type: "WALKER",
      displayName: "Escuela Canina Profesional",
      bio: "Cursos de obediencia básica y avanzada para perros de todas las edades. Clases grupales e individuales. Métodos de refuerzo positivo. También ofrecemos clases para dueños.",
      experience: 7,
      certifications: JSON.stringify(["Adiestramiento con refuerzo positivo", "Curso para dueños primerizos"]),
      photos: JSON.stringify([]),
      coverageRadius: 15,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.7,
      totalServices: 198,
      averageRating: 4.8,
      responseTime: 30,
      acceptanceRate: 92,
      isActive: true,
    },
  });
  await prisma.providerBadge.createMany({
    data: [
      { providerId: escuelaProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: escuelaProfile.id, type: "CERTIFIED" },
    ],
  });

  const dogMasterProfile = await prisma.providerProfile.create({
    data: {
      userId: dogMaster.id,
      type: "WALKER",
      displayName: "Dog Master Chile",
      bio: "Especialistas en comportamiento canino. Modificación de conducta, socialización y deporte canino (agility, nosework). Atención individual para perros con problemas de comportamiento.",
      experience: 5,
      certifications: JSON.stringify(["Etología canina", "Agility competitivo", "Nosework"]),
      photos: JSON.stringify([]),
      coverageRadius: 12,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.6,
      totalServices: 145,
      averageRating: 4.7,
      responseTime: 35,
      acceptanceRate: 85,
      isActive: true,
    },
  });
  await prisma.providerBadge.createMany({
    data: [
      { providerId: dogMasterProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: dogMasterProfile.id, type: "CERTIFIED" },
    ],
  });

  await prisma.service.createMany({
    data: [
      {
        providerId: escuelaK9.id,
        type: "TRAINING",
        title: "Obediencia básica — Clases grupales",
        description: "Clases grupales de obediencia básica: sentado, quieto, ven, caminar sin tirar. Grupos de máximo 6 perros. Ideal para cachorros y perros adultos que recién comienzan.",
        pricePerUnit: 25000,
        city: "Santiago",
        latitude: -33.4489,
        longitude: -70.6693,
        isActive: true,
      },
      {
        providerId: escuelaK9.id,
        type: "TRAINING",
        title: "Adiestramiento avanzado — Clase individual",
        description: "Sesión individual personalizada. Trabajamos obediencia avanzada, control a distancia, agility básico o modificación de conducta según las necesidades de tu perro.",
        pricePerUnit: 45000,
        city: "Santiago",
        latitude: -33.4489,
        longitude: -70.6693,
        isActive: true,
      },
      {
        providerId: escuelaCanina.id,
        type: "TRAINING",
        title: "Curso de obediencia — 8 sesiones",
        description: "Programa completo de 8 sesiones de obediencia con refuerzo positivo. Incluye guía de seguimiento para practicar en casa. Certificado al finalizar.",
        pricePerUnit: 120000,
        city: "Providencia",
        latitude: -33.4254,
        longitude: -70.6156,
        isActive: true,
      },
      {
        providerId: escuelaCanina.id,
        type: "TRAINING",
        title: "Clase para dueños — Cómo comunicarte con tu perro",
        description: "Aprende a entender el lenguaje canino y comunicarte efectivamente con tu mascota. Técnicas de refuerzo positivo, manejo de la correa y resolución de problemas comunes.",
        pricePerUnit: 18000,
        city: "Providencia",
        latitude: -33.4254,
        longitude: -70.6156,
        isActive: true,
      },
      {
        providerId: dogMaster.id,
        type: "TRAINING",
        title: "Modificación de conducta — Consulta individual",
        description: "Evaluación y plan de modificación de conducta para perros con ladridos excesivos, agresividad, ansiedad por separación u otros problemas de comportamiento.",
        pricePerUnit: 55000,
        city: "Las Condes",
        latitude: -33.4094,
        longitude: -70.5797,
        isActive: true,
      },
      {
        providerId: dogMaster.id,
        type: "TRAINING",
        title: "Agility para principiantes",
        description: "Introduce a tu perro al deporte del agility. Clases divertidas con obstáculos adaptados. Mejora la coordinación, la confianza y el vínculo contigo. Todas las razas bienvenidas.",
        pricePerUnit: 30000,
        city: "Las Condes",
        latitude: -33.4094,
        longitude: -70.5797,
        isActive: true,
      },
    ],
  });

  console.log("Training schools seeded successfully!");
  console.log("  - contacto@k9chile.cl / 123456");
  console.log("  - info@escuelacanina.cl / 123456");
  console.log("  - hola@dogmaster.cl / 123456");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

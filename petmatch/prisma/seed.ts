import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";

function createClient() {
  if (url.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: url });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

async function main() {
  // Solo seedear si la base de datos está vacía
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.insurancePolicyPayment.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.insurancePlan.deleteMany();
  await prisma.adoptionApplication.deleteMany();
  await prisma.adoptionPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.bookingEvent.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.walkTracking.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.providerBadge.deleteMany();
  await prisma.providerDocument.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.petMedication.deleteMany();
  await prisma.petDocument.deleteMany();
  await prisma.petVaccine.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.serviceAvailability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.report.deleteMany();
  await prisma.vetClinic.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 12);

  // ─── USERS (8) ──────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: "admin@petmatch.cl",
      name: "Admin PetMatch",
      passwordHash,
      role: "ADMIN",
      city: "Santiago",
      latitude: -33.4489,
      longitude: -70.6693,
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: "maria@email.com",
      name: "Maria Garcia",
      passwordHash,
      role: "OWNER",
      city: "Santiago",
      bio: "Amante de los perros, tengo 2 labradores hermosos.",
      phone: "+56 9 1234 5678",
      latitude: -33.4372,
      longitude: -70.6506,
    },
  });

  const carlos = await prisma.user.create({
    data: {
      email: "carlos@email.com",
      name: "Carlos Rodriguez",
      passwordHash,
      role: "WALKER",
      city: "Santiago",
      bio: "Paseador profesional con 5 anos de experiencia. Amo a los animales.",
      phone: "+56 9 8765 4321",
      latitude: -33.4250,
      longitude: -70.6150,
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: "ana@email.com",
      name: "Ana Perez",
      passwordHash,
      role: "OWNER",
      city: "Providencia",
      bio: "Mama de un gatito y un perro pastor aleman.",
      latitude: -33.4280,
      longitude: -70.6110,
    },
  });

  const clinic = await prisma.user.create({
    data: {
      email: "clinica@vetpro.cl",
      name: "VetPro Clinica",
      passwordHash,
      role: "CLINIC",
      city: "Santiago",
    },
  });

  const sofia = await prisma.user.create({
    data: {
      email: "sofia@email.com",
      name: "Sofia Mendoza",
      passwordHash,
      role: "OWNER",
      city: "Las Condes",
      bio: "Mama de Toby, un Pomeranian muy consentido.",
      phone: "+56 9 5555 1234",
      latitude: -33.4050,
      longitude: -70.5670,
    },
  });

  const pedro = await prisma.user.create({
    data: {
      email: "pedro@email.com",
      name: "Pedro Sanchez",
      passwordHash,
      role: "WALKER",
      city: "Santiago",
      bio: "Groomer profesional certificado. Tambien paseo perros los fines de semana.",
      phone: "+56 9 7777 4321",
      latitude: -33.4400,
      longitude: -70.6300,
    },
  });

  const valentina = await prisma.user.create({
    data: {
      email: "valentina@email.com",
      name: "Valentina Torres",
      passwordHash,
      role: "VET",
      city: "Santiago",
      bio: "Veterinaria a domicilio con 8 anos de experiencia. Especialista en medicina preventiva.",
      phone: "+56 9 3333 8765",
      latitude: -33.4320,
      longitude: -70.6200,
    },
  });

  // ─── PROVIDER PROFILES (3) ─────────────────────────

  const carlosProfile = await prisma.providerProfile.create({
    data: {
      userId: carlos.id,
      type: "WALKER",
      displayName: "Carlos Rodriguez",
      bio: "Paseador profesional con 5 anos de experiencia. Certificado en primeros auxilios caninos. Amo a los animales y trato a cada mascota como si fuera mia.",
      experience: 5,
      certifications: JSON.stringify(["Primeros auxilios caninos", "Comportamiento animal basico"]),
      photos: JSON.stringify([]),
      coverageRadius: 10,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.8,
      totalServices: 127,
      averageRating: 4.9,
      responseTime: 15,
      acceptanceRate: 95,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: carlosProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: carlosProfile.id, type: "BACKGROUND_OK" },
      { providerId: carlosProfile.id, type: "SUPER_PROVIDER" },
      { providerId: carlosProfile.id, type: "FOUNDER" },
    ],
  });

  const pedroProfile = await prisma.providerProfile.create({
    data: {
      userId: pedro.id,
      type: "GROOMER",
      displayName: "Pedro Sanchez",
      bio: "Groomer certificado con 3 anos de experiencia. Experto en razas pequenas y medianas. Uso productos hipoalergenicos.",
      experience: 3,
      certifications: JSON.stringify(["Grooming profesional - Escuela Canina Chile", "Manejo de razas especiales"]),
      photos: JSON.stringify([]),
      coverageRadius: 8,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.5,
      totalServices: 64,
      averageRating: 4.7,
      responseTime: 25,
      acceptanceRate: 90,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: pedroProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: pedroProfile.id, type: "BACKGROUND_OK" },
    ],
  });

  const valentinaProfile = await prisma.providerProfile.create({
    data: {
      userId: valentina.id,
      type: "VET",
      displayName: "Dra. Valentina Torres",
      bio: "Veterinaria a domicilio con 8 anos de experiencia. Consultas generales, vacunacion, desparasitacion y medicina preventiva. Atencion personalizada y sin estres para tu mascota.",
      experience: 8,
      certifications: JSON.stringify(["Medicina Veterinaria - U. de Chile", "Diplomado en medicina preventiva"]),
      photos: JSON.stringify([]),
      coverageRadius: 15,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.9,
      totalServices: 215,
      averageRating: 4.95,
      responseTime: 30,
      acceptanceRate: 88,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: valentinaProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: valentinaProfile.id, type: "BACKGROUND_OK" },
      { providerId: valentinaProfile.id, type: "SUPER_PROVIDER" },
    ],
  });

  // ─── PETS (6) ──────────────────────────────────────

  const luna = await prisma.pet.create({
    data: {
      ownerId: maria.id,
      name: "Luna",
      species: "DOG",
      breed: "Labrador Retriever",
      sex: "FEMALE",
      dateOfBirth: new Date("2023-03-15"),
      size: "LARGE",
      energyLevel: "HIGH",
      temperament: JSON.stringify(["Jugueton", "Amigable", "Sociable"]),
      age: 36,
      weight: 28,
      isVaccinated: true,
      isNeutered: true,
      microchipId: "CL-98765432",
      allergies: JSON.stringify(["Pollo"]),
      medicalConditions: JSON.stringify([]),
      diet: "Royal Canin Labrador Adult 12kg",
      description: "Luna es una labrador dorada muy carinosa. Le encanta jugar en el parque y nadar.",
      profileCompletion: 85,
    },
  });

  const max = await prisma.pet.create({
    data: {
      ownerId: maria.id,
      name: "Max",
      species: "DOG",
      breed: "Labrador Retriever",
      sex: "MALE",
      dateOfBirth: new Date("2021-06-20"),
      size: "LARGE",
      energyLevel: "MEDIUM",
      temperament: JSON.stringify(["Tranquilo", "Obediente", "Amigable"]),
      age: 60,
      weight: 32,
      isVaccinated: true,
      isNeutered: true,
      allergies: JSON.stringify([]),
      medicalConditions: JSON.stringify(["Displasia de cadera leve"]),
      diet: "Royal Canin Labrador Adult 12kg",
      description: "Max es el hermano mayor de Luna. Muy tranquilo y protector.",
      profileCompletion: 75,
    },
  });

  const coco = await prisma.pet.create({
    data: {
      ownerId: ana.id,
      name: "Coco",
      species: "DOG",
      breed: "Pastor Aleman",
      sex: "MALE",
      dateOfBirth: new Date("2024-03-10"),
      size: "LARGE",
      energyLevel: "HIGH",
      temperament: JSON.stringify(["Protector", "Energetico", "Obediente"]),
      age: 24,
      weight: 35,
      isVaccinated: true,
      isNeutered: false,
      description: "Coco es un pastor aleman muy inteligente y leal.",
      profileCompletion: 60,
    },
  });

  const michi = await prisma.pet.create({
    data: {
      ownerId: ana.id,
      name: "Michi",
      species: "CAT",
      breed: "Mestizo",
      sex: "FEMALE",
      dateOfBirth: new Date("2024-09-01"),
      size: "SMALL",
      energyLevel: "LOW",
      temperament: JSON.stringify(["Independiente", "Curioso", "Tranquilo"]),
      age: 18,
      weight: 4,
      isVaccinated: true,
      isNeutered: true,
      description: "Michi es un gatito muy tranquilo que le gusta dormir al sol.",
      profileCompletion: 55,
    },
  });

  const toby = await prisma.pet.create({
    data: {
      ownerId: sofia.id,
      name: "Toby",
      species: "DOG",
      breed: "Pomeranian",
      sex: "MALE",
      dateOfBirth: new Date("2024-01-10"),
      size: "SMALL",
      energyLevel: "HIGH",
      temperament: JSON.stringify(["Jugueton", "Curioso", "Vocal"]),
      age: 14,
      weight: 3.5,
      isVaccinated: true,
      isNeutered: true,
      description: "Toby es un Pomeranian super energetico. Le encanta ladrar y jugar con pelotas.",
      profileCompletion: 70,
    },
  });

  const rocky = await prisma.pet.create({
    data: {
      ownerId: pedro.id,
      name: "Rocky",
      species: "DOG",
      breed: "Bulldog Frances",
      sex: "MALE",
      dateOfBirth: new Date("2023-07-05"),
      size: "MEDIUM",
      energyLevel: "LOW",
      temperament: JSON.stringify(["Tranquilo", "Amigable", "Perezoso"]),
      age: 32,
      weight: 12,
      isVaccinated: true,
      isNeutered: true,
      description: "Rocky es el companero de Pedro. Un bulldog frances muy relajado.",
      profileCompletion: 65,
    },
  });

  // ─── PET VACCINES ──────────────────────────────────

  await prisma.petVaccine.createMany({
    data: [
      { petId: luna.id, name: "Rabia", dateAdministered: new Date("2025-09-15"), nextDueDate: new Date("2026-09-15"), veterinarian: "Dr. Fernandez - VetPro", notes: "Aplicada sin reacciones adversas" },
      { petId: luna.id, name: "Sextuple (DHLPP)", dateAdministered: new Date("2025-06-10"), nextDueDate: new Date("2026-06-10"), veterinarian: "Dr. Fernandez - VetPro" },
      { petId: luna.id, name: "Bordetella (Tos de las perreras)", dateAdministered: new Date("2025-12-01"), nextDueDate: new Date("2026-06-01"), veterinarian: "Dr. Fernandez - VetPro" },
      { petId: max.id, name: "Rabia", dateAdministered: new Date("2025-08-20"), nextDueDate: new Date("2026-08-20"), veterinarian: "Dr. Fernandez - VetPro" },
      { petId: max.id, name: "Sextuple (DHLPP)", dateAdministered: new Date("2025-05-15"), nextDueDate: new Date("2026-05-15"), veterinarian: "Dr. Fernandez - VetPro" },
      { petId: coco.id, name: "Rabia", dateAdministered: new Date("2025-11-10"), nextDueDate: new Date("2026-11-10"), veterinarian: "Dra. Lopez - Animal Center" },
      { petId: coco.id, name: "Sextuple (DHLPP)", dateAdministered: new Date("2025-10-05"), nextDueDate: new Date("2026-04-05"), veterinarian: "Dra. Lopez - Animal Center" },
      { petId: toby.id, name: "Rabia", dateAdministered: new Date("2025-10-20"), nextDueDate: new Date("2026-10-20"), veterinarian: "Dra. Torres" },
      { petId: toby.id, name: "Sextuple (DHLPP)", dateAdministered: new Date("2025-07-15"), nextDueDate: new Date("2026-07-15"), veterinarian: "Dra. Torres" },
      { petId: rocky.id, name: "Rabia", dateAdministered: new Date("2025-12-01"), nextDueDate: new Date("2026-12-01"), veterinarian: "Dr. Fernandez - VetPro" },
    ],
  });

  // ─── PET MEDICATIONS ───────────────────────────────

  await prisma.petMedication.createMany({
    data: [
      { petId: max.id, name: "Condroitina + Glucosamina", dosage: "1 tableta", frequency: "1 vez al dia", startDate: new Date("2025-06-01"), isActive: true, notes: "Para displasia de cadera. Dar con comida." },
      { petId: luna.id, name: "Desparasitante interno (Milbemax)", dosage: "1 tableta segun peso", frequency: "Cada 3 meses", startDate: new Date("2025-12-15"), isActive: true, notes: "Proxima dosis: marzo 2026" },
    ],
  });

  // ─── REMINDERS ─────────────────────────────────────

  await prisma.reminder.createMany({
    data: [
      { userId: maria.id, petId: luna.id, type: "VACCINE", title: "Vacuna Bordetella - Luna", description: "Refuerzo de vacuna Bordetella (tos de las perreras)", dueDate: new Date("2026-06-01"), recurrence: "BIANNUAL", status: "PENDING", notifyBefore: 7 },
      { userId: maria.id, petId: luna.id, type: "DEWORMING", title: "Desparasitacion interna - Luna", description: "Milbemax segun peso", dueDate: new Date("2026-03-15"), recurrence: "QUARTERLY", status: "PENDING", notifyBefore: 3 },
      { userId: maria.id, petId: max.id, type: "VACCINE", title: "Vacuna Sextuple - Max", description: "Refuerzo anual de vacuna sextuple DHLPP", dueDate: new Date("2026-05-15"), recurrence: "ANNUAL", status: "PENDING", notifyBefore: 7 },
      { userId: maria.id, petId: max.id, type: "CHECKUP", title: "Control displasia - Max", description: "Chequeo semestral de displasia de cadera con radiografia", dueDate: new Date("2026-06-01"), recurrence: "BIANNUAL", status: "PENDING", notifyBefore: 14 },
      { userId: ana.id, petId: coco.id, type: "VACCINE", title: "Vacuna Sextuple - Coco", description: "Refuerzo vacuna sextuple DHLPP", dueDate: new Date("2026-04-05"), recurrence: "ANNUAL", status: "PENDING", notifyBefore: 7 },
      { userId: sofia.id, petId: toby.id, type: "GROOMING", title: "Grooming mensual - Toby", description: "Bano y corte de pelo mensual", dueDate: new Date("2026-04-01"), recurrence: "MONTHLY", status: "PENDING", notifyBefore: 3 },
    ],
  });

  // ─── SERVICES (7) ──────────────────────────────────

  const paseoService = await prisma.service.create({
    data: {
      providerId: carlos.id,
      type: "WALK",
      title: "Paseo matutino en Parque Forestal",
      description: "Paseo de 1 hora por el Parque Forestal. Incluyo fotos y reporte del paseo. Acepto perros de todos los tamanos.",
      pricePerUnit: 8000,
      priceUnit: "PER_HOUR",
      duration: 60,
      maxPets: 3,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
      acceptedSpecies: JSON.stringify(["DOG"]),
      city: "Santiago",
      latitude: -33.4372,
      longitude: -70.6345,
      radiusKm: 10,
      isActive: true,
    },
  });

  await prisma.serviceAvailability.createMany({
    data: [
      { serviceId: paseoService.id, dayOfWeek: "MONDAY", startTime: "07:00", endTime: "12:00", maxBookings: 3 },
      { serviceId: paseoService.id, dayOfWeek: "TUESDAY", startTime: "07:00", endTime: "12:00", maxBookings: 3 },
      { serviceId: paseoService.id, dayOfWeek: "WEDNESDAY", startTime: "07:00", endTime: "12:00", maxBookings: 3 },
      { serviceId: paseoService.id, dayOfWeek: "THURSDAY", startTime: "07:00", endTime: "12:00", maxBookings: 3 },
      { serviceId: paseoService.id, dayOfWeek: "FRIDAY", startTime: "07:00", endTime: "12:00", maxBookings: 3 },
      { serviceId: paseoService.id, dayOfWeek: "SATURDAY", startTime: "08:00", endTime: "14:00", maxBookings: 4 },
    ],
  });

  const sittingService = await prisma.service.create({
    data: {
      providerId: carlos.id,
      type: "SITTING",
      title: "Cuidado en casa por horas",
      description: "Cuido a tu mascota en mi casa. Ambiente seguro con patio cerrado. Perfecto para cuando sales por unas horas.",
      pricePerUnit: 12000,
      priceUnit: "PER_VISIT",
      duration: 180,
      maxPets: 2,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Santiago",
      latitude: -33.4250,
      longitude: -70.6150,
      radiusKm: 8,
      isActive: true,
    },
  });

  const daycareService = await prisma.service.create({
    data: {
      providerId: carlos.id,
      type: "DAYCARE",
      title: "Guarderia canina diurna",
      description: "Guarderia para perros de 8am a 6pm. Juegos, paseos y socializacion con otros perros.",
      pricePerUnit: 15000,
      priceUnit: "PER_DAY",
      duration: 600,
      maxPets: 5,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE"]),
      acceptedSpecies: JSON.stringify(["DOG"]),
      city: "Santiago",
      latitude: -33.4250,
      longitude: -70.6150,
      radiusKm: 15,
      isActive: true,
    },
  });

  const groomingService = await prisma.service.create({
    data: {
      providerId: pedro.id,
      type: "GROOMING",
      title: "Grooming completo",
      description: "Bano, secado, corte de pelo, limpieza de oidos, corte de unas y perfume. Productos hipoalergenicos.",
      pricePerUnit: 25000,
      priceUnit: "PER_VISIT",
      duration: 120,
      maxPets: 1,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE"]),
      acceptedSpecies: JSON.stringify(["DOG"]),
      city: "Santiago",
      latitude: -33.4400,
      longitude: -70.6300,
      radiusKm: 10,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      providerId: pedro.id,
      type: "GROOMING",
      title: "Bano y corte express",
      description: "Bano rapido con shampoo premium, secado y corte basico. Ideal para mantenimiento regular.",
      pricePerUnit: 15000,
      priceUnit: "PER_VISIT",
      duration: 60,
      maxPets: 1,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Santiago",
      latitude: -33.4400,
      longitude: -70.6300,
      radiusKm: 8,
      isActive: true,
    },
  });

  const vetHomeService = await prisma.service.create({
    data: {
      providerId: valentina.id,
      type: "VET_HOME",
      title: "Consulta veterinaria a domicilio",
      description: "Consulta veterinaria completa en la comodidad de tu hogar. Examen fisico, diagnostico y tratamiento. Sin estres de transporte para tu mascota.",
      pricePerUnit: 30000,
      priceUnit: "PER_VISIT",
      duration: 60,
      maxPets: 2,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Santiago",
      latitude: -33.4320,
      longitude: -70.6200,
      radiusKm: 15,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      providerId: valentina.id,
      type: "VET_HOME",
      title: "Vacunacion a domicilio",
      description: "Servicio de vacunacion a domicilio. Incluye vacuna, carnet de vacunacion y certificado. Todas las vacunas disponibles.",
      pricePerUnit: 20000,
      priceUnit: "PER_VISIT",
      duration: 30,
      maxPets: 4,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Santiago",
      latitude: -33.4320,
      longitude: -70.6200,
      radiusKm: 15,
      isActive: true,
    },
  });

  // ─── BOOKINGS (7) ──────────────────────────────────

  // 1. Completed booking — Maria → Carlos (walk) with review
  const completedBooking = await prisma.booking.create({
    data: {
      serviceId: paseoService.id,
      clientId: maria.id,
      providerId: carlos.id,
      petId: luna.id,
      status: "COMPLETED",
      startDate: new Date("2026-03-01T08:00:00"),
      endDate: new Date("2026-03-01T09:00:00"),
      totalPrice: 8560,
      serviceFee: 560,
      platformFee: 1200,
      providerEarnings: 6800,
      checkinAt: new Date("2026-03-01T07:58:00"),
      checkinLat: -33.4372,
      checkinLng: -70.6506,
      checkoutAt: new Date("2026-03-01T09:05:00"),
      checkoutLat: -33.4370,
      checkoutLng: -70.6340,
    },
  });

  await prisma.bookingEvent.createMany({
    data: [
      { bookingId: completedBooking.id, type: "CREATED", data: JSON.stringify({ source: "web" }) },
      { bookingId: completedBooking.id, type: "CONFIRMED" },
      { bookingId: completedBooking.id, type: "CHECKIN", data: JSON.stringify({ lat: -33.4372, lng: -70.6506 }) },
      { bookingId: completedBooking.id, type: "CHECKOUT", data: JSON.stringify({ lat: -33.4370, lng: -70.6340 }) },
      { bookingId: completedBooking.id, type: "COMPLETED" },
    ],
  });

  await prisma.reportCard.create({
    data: {
      bookingId: completedBooking.id,
      mood: "HAPPY",
      activities: JSON.stringify(["WALK", "PLAY", "SOCIALIZED"]),
      didPee: true,
      didPoop: true,
      ateFood: false,
      drankWater: true,
      photos: JSON.stringify([]),
      notes: "Luna estuvo muy feliz! Jugo con otros perros en el parque y corrimos por la ribera del rio.",
    },
  });

  // 2. Confirmed booking — Maria → Carlos (next walk)
  await prisma.booking.create({
    data: {
      serviceId: paseoService.id,
      clientId: maria.id,
      providerId: carlos.id,
      petId: luna.id,
      status: "CONFIRMED",
      startDate: new Date("2026-03-18T08:00:00"),
      endDate: new Date("2026-03-18T09:00:00"),
      totalPrice: 8560,
      serviceFee: 560,
      platformFee: 1200,
      providerEarnings: 6800,
      notes: "Misma ruta que la vez pasada por favor",
    },
  });

  // 3. Pending booking — Ana → Carlos (sitting)
  await prisma.booking.create({
    data: {
      serviceId: sittingService.id,
      clientId: ana.id,
      providerId: carlos.id,
      petId: coco.id,
      status: "PENDING",
      startDate: new Date("2026-03-20T10:00:00"),
      endDate: new Date("2026-03-20T13:00:00"),
      totalPrice: 12840,
      serviceFee: 840,
      platformFee: 1800,
      providerEarnings: 10200,
      notes: "Coco es un poco timido con desconocidos al principio",
    },
  });

  // 4. Completed booking — Sofia → Carlos (walk) with mixed review
  const sofiaCompletedBooking = await prisma.booking.create({
    data: {
      serviceId: paseoService.id,
      clientId: sofia.id,
      providerId: carlos.id,
      petId: toby.id,
      status: "COMPLETED",
      startDate: new Date("2026-03-05T09:00:00"),
      endDate: new Date("2026-03-05T10:00:00"),
      totalPrice: 8560,
      serviceFee: 560,
      platformFee: 1200,
      providerEarnings: 6800,
      checkinAt: new Date("2026-03-05T09:10:00"),
      checkinLat: -33.4050,
      checkinLng: -70.5670,
      checkoutAt: new Date("2026-03-05T10:05:00"),
      checkoutLat: -33.4055,
      checkoutLng: -70.5680,
    },
  });

  // 5. Cancelled booking — Ana → Carlos (daycare)
  const cancelledBooking = await prisma.booking.create({
    data: {
      serviceId: daycareService.id,
      clientId: ana.id,
      providerId: carlos.id,
      petId: coco.id,
      status: "CANCELLED",
      startDate: new Date("2026-03-10T08:00:00"),
      endDate: new Date("2026-03-10T18:00:00"),
      totalPrice: 16050,
      serviceFee: 1050,
      platformFee: 2250,
      providerEarnings: 12750,
      cancellationReason: "Cambio de planes de viaje",
      cancelledBy: ana.id,
    },
  });

  await prisma.bookingEvent.createMany({
    data: [
      { bookingId: cancelledBooking.id, type: "CREATED" },
      { bookingId: cancelledBooking.id, type: "CONFIRMED" },
      { bookingId: cancelledBooking.id, type: "CANCELLED", data: JSON.stringify({ reason: "Cambio de planes de viaje", refundPercentage: 50 }) },
    ],
  });

  // 6. In-progress booking — Maria → Pedro (grooming) with checkin
  const inProgressBooking = await prisma.booking.create({
    data: {
      serviceId: groomingService.id,
      clientId: maria.id,
      providerId: pedro.id,
      petId: max.id,
      status: "IN_PROGRESS",
      startDate: new Date("2026-03-15T10:00:00"),
      endDate: new Date("2026-03-15T12:00:00"),
      totalPrice: 26750,
      serviceFee: 1750,
      platformFee: 3750,
      providerEarnings: 21250,
      checkinAt: new Date("2026-03-15T09:58:00"),
      checkinLat: -33.4372,
      checkinLng: -70.6506,
    },
  });

  await prisma.bookingEvent.createMany({
    data: [
      { bookingId: inProgressBooking.id, type: "CREATED" },
      { bookingId: inProgressBooking.id, type: "CONFIRMED" },
      { bookingId: inProgressBooking.id, type: "CHECKIN", data: JSON.stringify({ lat: -33.4372, lng: -70.6506 }) },
    ],
  });

  // 7. Confirmed booking — Sofia → Valentina (vet home)
  await prisma.booking.create({
    data: {
      serviceId: vetHomeService.id,
      clientId: sofia.id,
      providerId: valentina.id,
      petId: toby.id,
      status: "CONFIRMED",
      startDate: new Date("2026-03-22T15:00:00"),
      endDate: new Date("2026-03-22T16:00:00"),
      totalPrice: 32100,
      serviceFee: 2100,
      platformFee: 4500,
      providerEarnings: 25500,
      notes: "Toby necesita chequeo general y posiblemente vacuna",
    },
  });

  // ─── REVIEWS (3) ───────────────────────────────────

  // Maria → Carlos: 5 stars (excellent)
  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      authorId: maria.id,
      targetId: carlos.id,
      rating: 5,
      punctualityRating: 5,
      careRating: 5,
      communicationRating: 5,
      comment: "Excelente servicio! Luna volvio feliz y cansada. Carlos es muy profesional y envio fotos durante todo el paseo. Muy recomendado.",
      isVerified: true,
    },
  });

  // Sofia → Carlos: 4 stars (mixed — arrived late)
  await prisma.review.create({
    data: {
      bookingId: sofiaCompletedBooking.id,
      authorId: sofia.id,
      targetId: carlos.id,
      rating: 4,
      punctualityRating: 3,
      careRating: 5,
      communicationRating: 4,
      comment: "Buen servicio en general, Toby lo paso bien. Pero llego 10 minutos tarde sin avisar. El cuidado fue excelente, solo la puntualidad fallo.",
      isVerified: true,
    },
  });

  // Maria → Pedro: 5 stars (grooming — from a previous completed booking)
  // We need a previous completed grooming booking for this review
  const prevGroomingBooking = await prisma.booking.create({
    data: {
      serviceId: groomingService.id,
      clientId: maria.id,
      providerId: pedro.id,
      petId: luna.id,
      status: "COMPLETED",
      startDate: new Date("2026-02-20T14:00:00"),
      endDate: new Date("2026-02-20T16:00:00"),
      totalPrice: 26750,
      serviceFee: 1750,
      platformFee: 3750,
      providerEarnings: 21250,
      checkinAt: new Date("2026-02-20T13:55:00"),
      checkoutAt: new Date("2026-02-20T15:50:00"),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: prevGroomingBooking.id,
      authorId: maria.id,
      targetId: pedro.id,
      rating: 5,
      punctualityRating: 5,
      careRating: 5,
      communicationRating: 5,
      comment: "Luna quedo hermosa! Pedro es muy delicado y paciente con las mascotas. Usa productos de calidad y el resultado fue increible.",
      isVerified: true,
    },
  });

  // ─── CONVERSATIONS & MESSAGES ──────────────────────

  // Conversation 1: Maria ↔ Carlos (about next walk)
  const convo1 = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: maria.id },
          { userId: carlos.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, senderId: maria.id, content: "Hola Carlos! Queria confirmar el paseo del proximo miercoles", createdAt: new Date("2026-03-13T10:00:00") },
      { conversationId: convo1.id, senderId: carlos.id, content: "Hola Maria! Si, todo confirmado. Misma ruta por el Parque Forestal?", createdAt: new Date("2026-03-13T10:05:00") },
      { conversationId: convo1.id, senderId: maria.id, content: "Si por favor! Luna lo disfruto mucho la vez pasada", createdAt: new Date("2026-03-13T10:08:00") },
      { conversationId: convo1.id, senderId: carlos.id, content: "Perfecto! Llego a las 8am como siempre. Le traere su snack favorito", createdAt: new Date("2026-03-13T10:10:00") },
      { conversationId: convo1.id, senderId: maria.id, content: "Genial! Una cosa, esta semana tiene un poco de alergia. Le estoy dando antihistaminico", createdAt: new Date("2026-03-13T10:15:00") },
      { conversationId: convo1.id, senderId: carlos.id, content: "Entendido, la cuidare bien. Si noto algo raro te aviso de inmediato", createdAt: new Date("2026-03-13T10:18:00") },
    ],
  });

  // Conversation 2: Ana ↔ Carlos (about cancelled booking)
  const convo2 = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: ana.id },
          { userId: carlos.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo2.id, senderId: ana.id, content: "Hola Carlos, disculpa pero debo cancelar la guarderia del martes", createdAt: new Date("2026-03-08T16:00:00") },
      { conversationId: convo2.id, senderId: carlos.id, content: "No hay problema Ana, entiendo. Quieres reagendar para otra fecha?", createdAt: new Date("2026-03-08T16:10:00") },
      { conversationId: convo2.id, senderId: ana.id, content: "Si! Te aviso la proxima semana cuando tenga la nueva fecha de viaje. Gracias por entender!", createdAt: new Date("2026-03-08T16:15:00") },
    ],
  });

  // Conversation 3: Sofia ↔ Valentina (about vet consultation)
  const convo3 = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: sofia.id },
          { userId: valentina.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo3.id, senderId: sofia.id, content: "Hola Dra. Torres! Reserve la consulta para Toby el 22 de marzo", createdAt: new Date("2026-03-14T11:00:00") },
      { conversationId: convo3.id, senderId: valentina.id, content: "Hola Sofia! Perfecto, vi la reserva. Que sintomas tiene Toby?", createdAt: new Date("2026-03-14T11:30:00") },
      { conversationId: convo3.id, senderId: sofia.id, content: "Ha estado rascandose mucho y tiene la piel un poco roja en la pancita. Tambien le toca la vacuna anual", createdAt: new Date("2026-03-14T11:35:00") },
      { conversationId: convo3.id, senderId: valentina.id, content: "Podria ser dermatitis alergica, es comun en Pomeranians. Llevar la vacuna tambien. Nos vemos el 22!", createdAt: new Date("2026-03-14T11:45:00") },
    ],
  });

  // ─── SWIPES & MATCHES ─────────────────────────────

  // Luna → Coco (LIKE) — Maria's dog likes Ana's dog
  await prisma.swipe.create({
    data: {
      senderId: maria.id,
      receiverId: ana.id,
      petId: luna.id,
      targetPetId: coco.id,
      action: "LIKE",
    },
  });

  // Coco → Luna (LIKE) — Ana's dog likes Maria's dog → MATCH!
  await prisma.swipe.create({
    data: {
      senderId: ana.id,
      receiverId: maria.id,
      petId: coco.id,
      targetPetId: luna.id,
      action: "LIKE",
    },
  });

  // Toby → Luna (LIKE) — Sofia's dog likes Maria's dog
  await prisma.swipe.create({
    data: {
      senderId: sofia.id,
      receiverId: maria.id,
      petId: toby.id,
      targetPetId: luna.id,
      action: "LIKE",
    },
  });

  // Luna → Toby (PASS) — Maria's dog passes on Sofia's dog
  await prisma.swipe.create({
    data: {
      senderId: maria.id,
      receiverId: sofia.id,
      petId: luna.id,
      targetPetId: toby.id,
      action: "PASS",
    },
  });

  // Coco → Toby (LIKE) — Ana's dog likes Sofia's dog (pending)
  await prisma.swipe.create({
    data: {
      senderId: ana.id,
      receiverId: sofia.id,
      petId: coco.id,
      targetPetId: toby.id,
      action: "LIKE",
    },
  });

  // ─── PRODUCTS — MARKETPLACE (6) ────────────────────

  const product1 = await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Royal Canin Labrador Adult 12kg",
      description: "Alimento seco premium especialmente formulado para Labrador Retriever adulto. Rico en acidos grasos omega-3 para piel y pelaje saludable.",
      price: 45990,
      category: "FOOD",
      photos: JSON.stringify([]),
      stock: 15,
      petSpecies: JSON.stringify(["DOG"]),
      approvalStatus: "APPROVED",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Kong Classic Rojo Large",
      description: "Juguete interactivo rellenable para perros grandes. Ideal para mantener a tu perro entretenido y estimulado mentalmente.",
      price: 12990,
      category: "TOYS",
      photos: JSON.stringify([]),
      stock: 20,
      petSpecies: JSON.stringify(["DOG"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Collar GPS Tractive",
      description: "Collar con rastreo GPS en tiempo real para perros y gatos. Monitorea la actividad y ubicacion de tu mascota desde tu celular.",
      price: 89990,
      category: "ACCESSORIES",
      photos: JSON.stringify([]),
      stock: 5,
      petSpecies: JSON.stringify(["DOG", "CAT"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Shampoo hipoalergenico 500ml",
      description: "Shampoo suave formulado para pieles sensibles. Sin parabenos ni sulfatos. Apto para perros y gatos.",
      price: 8990,
      category: "GROOMING",
      photos: JSON.stringify([]),
      stock: 30,
      petSpecies: JSON.stringify(["DOG", "CAT"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Snacks dentales Greenies",
      description: "Snacks diseñados para limpiar los dientes de tu perro mientras mastica. Reduce placa y sarro hasta un 60%.",
      price: 15990,
      category: "TREATS",
      photos: JSON.stringify([]),
      stock: 25,
      petSpecies: JSON.stringify(["DOG"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Cepillo FURminator Large",
      description: "Cepillo profesional para eliminar el pelo muerto. Reduce la muda hasta un 90%. Para perros de pelo largo o corto.",
      price: 32990,
      category: "GROOMING",
      photos: JSON.stringify([]),
      stock: 8,
      petSpecies: JSON.stringify(["DOG", "CAT"]),
      approvalStatus: "APPROVED",
    },
  });

  // ─── ORDERS ────────────────────────────────────────

  // Order 1: Delivered — Maria bought Royal Canin + Kong
  const order1 = await prisma.order.create({
    data: {
      buyerId: maria.id,
      status: "DELIVERED",
      totalAmount: 58980,
      shippingAddress: "Av. Providencia 1234, Depto 5B, Santiago",
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: product1.id, quantity: 1, unitPrice: 45990 },
      { orderId: order1.id, productId: product2.id, quantity: 1, unitPrice: 12990 },
    ],
  });

  // Order 2: Pending — Sofia ordered GPS collar
  const order2 = await prisma.order.create({
    data: {
      buyerId: sofia.id,
      status: "PENDING",
      totalAmount: 89990,
      shippingAddress: "Las Condes 5678, Santiago",
    },
  });

  // Find GPS collar product
  const gpsCollar = await prisma.product.findFirst({ where: { title: { contains: "GPS" } } });
  if (gpsCollar) {
    await prisma.orderItem.create({
      data: { orderId: order2.id, productId: gpsCollar.id, quantity: 1, unitPrice: 89990 },
    });
  }

  // ─── FAVORITES ─────────────────────────────────────

  await prisma.favorite.createMany({
    data: [
      { userId: maria.id, serviceId: paseoService.id },
      { userId: sofia.id, serviceId: vetHomeService.id },
    ],
  });

  // ─── NOTIFICATIONS ─────────────────────────────────

  await prisma.notification.createMany({
    data: [
      { userId: maria.id, type: "BOOKING", title: "Reserva confirmada", body: "Carlos acepto tu reserva de paseo para el 18 de marzo", data: JSON.stringify({ link: "/dashboard/bookings" }) },
      { userId: maria.id, type: "REMINDER", title: "Recordatorio: Desparasitacion Luna", body: "La desparasitacion interna de Luna esta programada para hoy", data: JSON.stringify({ link: "/dashboard/reminders" }), isRead: true },
      { userId: maria.id, type: "REVIEW", title: "Nueva resena recibida", body: "Sofia dejo una resena de 4 estrellas en tu servicio" },
      { userId: carlos.id, type: "BOOKING", title: "Nueva reserva recibida", body: "Maria ha reservado tu servicio de paseo matutino para el 18 de marzo", data: JSON.stringify({ link: "/provider/bookings" }) },
      { userId: carlos.id, type: "REVIEW", title: "Nueva resena recibida", body: "Sofia te dejo una resena de 4 estrellas" },
      { userId: sofia.id, type: "BOOKING", title: "Reserva confirmada", body: "Dra. Valentina Torres acepto tu consulta veterinaria para el 22 de marzo", data: JSON.stringify({ link: "/dashboard/bookings" }) },
    ],
  });

  // ─── INCIDENT ──────────────────────────────────────

  await prisma.incident.create({
    data: {
      reporterId: maria.id,
      bookingId: completedBooking.id,
      category: "SERVICE",
      severity: "LOW",
      status: "RESOLVED",
      description: "El paseo duro 55 minutos en vez de 60 minutos contratados. No es grave pero queria reportarlo.",
      evidence: JSON.stringify([]),
      resolution: "Se converso con el proveedor. Se ofrecieron 5 minutos extra en el proximo paseo como compensacion.",
      resolvedBy: admin.id,
      resolvedAt: new Date("2026-03-02T14:00:00"),
    },
  });

  // ─── SUBSCRIPTIONS ─────────────────────────────────

  // Maria: PREMIUM
  await prisma.subscription.create({
    data: {
      userId: maria.id,
      plan: "PREMIUM",
      status: "ACTIVE",
      currentPeriodStart: new Date("2026-02-15"),
      currentPeriodEnd: new Date("2026-03-15"),
    },
  });

  // Sofia: FREE (default — to test swipe limits)
  await prisma.subscription.create({
    data: {
      userId: sofia.id,
      plan: "FREE",
      status: "ACTIVE",
      currentPeriodStart: new Date("2026-03-01"),
      currentPeriodEnd: new Date("2026-04-01"),
    },
  });

  // ─── MEDICAL VISITS (historial clínico para Luna y Max) ────────────────

  await prisma.medicalVisit.createMany({
    data: [
      {
        petId: luna.id,
        type: "CHECKUP",
        title: "Control anual",
        description: "Control de salud general. Peso, dientes, corazón y articulaciones en buen estado.",
        veterinarian: "Dr. Fernandez",
        clinic: "Clinica VetPro",
        diagnosis: "Mascota sana. Leve acumulacion de sarro.",
        treatment: "Limpieza dental programada para proximo mes.",
        cost: 25000,
        visitDate: new Date("2025-09-15"),
        nextVisit: new Date("2026-09-15"),
        notes: "Peso ideal 28kg. Se recomienda dieta control.",
      },
      {
        petId: luna.id,
        type: "VACCINATION",
        title: "Vacunacion anual",
        description: "Aplicacion de vacuna sextuple DHLPP y antirrábica.",
        veterinarian: "Dr. Fernandez",
        clinic: "Clinica VetPro",
        diagnosis: "Sana. Apta para vacunacion.",
        treatment: "Vacuna sextuple DHLPP + antirrábica aplicadas.",
        cost: 18000,
        visitDate: new Date("2025-06-10"),
        nextVisit: new Date("2026-06-10"),
      },
      {
        petId: luna.id,
        type: "CHECKUP",
        title: "Consulta por alergia",
        description: "Luna presenta picazon y enrojecimiento en zona abdominal.",
        veterinarian: "Dra. Valentina Torres",
        clinic: "A domicilio",
        diagnosis: "Dermatitis alergica estacional.",
        treatment: "Antihistaminico oral Cetirizina 10mg 1 vez al dia por 10 dias. Shampoo hipoalergenico.",
        cost: 30000,
        visitDate: new Date("2026-02-05"),
        nextVisit: new Date("2026-03-05"),
        notes: "Evitar contacto con pasto recien cortado. Revisar en 1 mes.",
      },
      {
        petId: max.id,
        type: "CHECKUP",
        title: "Control displasia de cadera",
        description: "Evaluacion semestral de displasia de cadera leve diagnosticada en 2024.",
        veterinarian: "Dr. Fernandez",
        clinic: "Clinica VetPro",
        diagnosis: "Displasia leve estable. Sin deterioro respecto a control anterior.",
        treatment: "Continuar con Condroitina + Glucosamina diaria. Ejercicio moderado sin saltos.",
        cost: 45000,
        visitDate: new Date("2025-12-10"),
        nextVisit: new Date("2026-06-10"),
        notes: "Radiografia adjunta en documentos. Mantener peso bajo 33kg.",
      },
      {
        petId: max.id,
        type: "VACCINATION",
        title: "Vacunacion anual Max",
        description: "Refuerzo sextuple y antirrábica.",
        veterinarian: "Dr. Fernandez",
        clinic: "Clinica VetPro",
        diagnosis: "Sano. Displasia controlada.",
        treatment: "Vacunas aplicadas sin incidentes.",
        cost: 18000,
        visitDate: new Date("2025-08-20"),
        nextVisit: new Date("2026-08-20"),
      },
      {
        petId: max.id,
        type: "DENTAL",
        title: "Limpieza dental bajo anestesia",
        description: "Limpieza profunda de sarro y pulido de piezas dentales.",
        veterinarian: "Dr. Fernandez",
        clinic: "Clinica VetPro",
        diagnosis: "Sarro moderado. Sin piezas comprometidas.",
        treatment: "Ultrasonido dental + pulido. Alta sin complicaciones.",
        cost: 85000,
        visitDate: new Date("2026-01-15"),
        notes: "Ayuno de 8 horas previo. Alta misma tarde.",
      },
    ],
  });

  // ─── MÁS PROVEEDORES ───────────────────────────────

  const lucia = await prisma.user.create({
    data: {
      email: "lucia@email.com",
      name: "Lucia Herrera",
      passwordHash,
      role: "WALKER",
      city: "Providencia",
      bio: "Cuidadora de mascotas con servicio de hospedaje en casa. Tengo patio cerrado y mucho amor para dar.",
      phone: "+56 9 4444 7890",
      latitude: -33.4310,
      longitude: -70.6050,
    },
  });

  const luciaProfile = await prisma.providerProfile.create({
    data: {
      userId: lucia.id,
      type: "BOARDING",
      displayName: "Lucia Herrera",
      bio: "Ofrezco hospedaje en casa para perros y gatos. Ambiente tranquilo, patio cerrado, camaras de seguridad. Maxima capacidad: 3 mascotas. Tu mascota dormira en una cama comoda y recibira todo el amor.",
      experience: 4,
      certifications: JSON.stringify(["Primeros auxilios mascotas - Cruz Roja", "Cuidador certificado PetSafe"]),
      photos: JSON.stringify([]),
      coverageRadius: 5,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.7,
      totalServices: 89,
      averageRating: 4.85,
      responseTime: 10,
      acceptanceRate: 92,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: luciaProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: luciaProfile.id, type: "BACKGROUND_OK" },
      { providerId: luciaProfile.id, type: "SPACE_VERIFIED" },
      { providerId: luciaProfile.id, type: "CERTIFIED" },
    ],
  });

  const jorge = await prisma.user.create({
    data: {
      email: "jorge@email.com",
      name: "Jorge Villalobos",
      passwordHash,
      role: "WALKER",
      city: "Nunoa",
      bio: "Paseador especializado en perros de razas pequenas. Rutas seguras y personalizadas.",
      phone: "+56 9 6666 3210",
      latitude: -33.4580,
      longitude: -70.5980,
    },
  });

  const jorgeProfile = await prisma.providerProfile.create({
    data: {
      userId: jorge.id,
      type: "WALKER",
      displayName: "Jorge Villalobos",
      bio: "Me especializo en razas pequenas: Pomeranian, Chihuahua, Yorkshire, Maltés y similares. Grupos pequenos de maximo 4 perros para atencion personalizada. Rutas sin trafico.",
      experience: 2,
      certifications: JSON.stringify(["Manejo de razas pequenas - AKC Chile"]),
      photos: JSON.stringify([]),
      coverageRadius: 6,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.3,
      totalServices: 38,
      averageRating: 4.6,
      responseTime: 20,
      acceptanceRate: 85,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: jorgeProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: jorgeProfile.id, type: "BACKGROUND_OK" },
    ],
  });

  const drRamirez = await prisma.user.create({
    data: {
      email: "dr.ramirez@email.com",
      name: "Dr. Marcos Ramirez",
      passwordHash,
      role: "VET",
      city: "Las Condes",
      bio: "Medico veterinario con 12 anos de experiencia. Especialista en medicina interna y oncologia veterinaria.",
      phone: "+56 9 2222 9876",
      latitude: -33.4080,
      longitude: -70.5700,
    },
  });

  const ramirezProfile = await prisma.providerProfile.create({
    data: {
      userId: drRamirez.id,
      type: "VET",
      displayName: "Dr. Marcos Ramirez - Medicina Interna",
      bio: "Veterinario especialista en medicina interna y oncologia. Consultas a domicilio y en clinica. Diagnostico avanzado con ecografia portatil. Atencion para perros, gatos y animales exoticos.",
      experience: 12,
      certifications: JSON.stringify([
        "Medicina Veterinaria - PUC",
        "Especialidad en Medicina Interna - U. de Buenos Aires",
        "Diplomado en Oncologia Veterinaria",
      ]),
      photos: JSON.stringify([]),
      coverageRadius: 20,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      trustScore: 4.95,
      totalServices: 412,
      averageRating: 4.97,
      responseTime: 45,
      acceptanceRate: 80,
      isActive: true,
    },
  });

  await prisma.providerBadge.createMany({
    data: [
      { providerId: ramirezProfile.id, type: "IDENTITY_VERIFIED" },
      { providerId: ramirezProfile.id, type: "BACKGROUND_OK" },
      { providerId: ramirezProfile.id, type: "SUPER_PROVIDER" },
      { providerId: ramirezProfile.id, type: "CERTIFIED" },
    ],
  });

  // ─── SERVICIOS DE NUEVOS PROVEEDORES ───────────────

  const boardingService = await prisma.service.create({
    data: {
      providerId: lucia.id,
      type: "BOARDING",
      title: "Hospedaje nocturno en casa",
      description: "Tu mascota se queda a dormir en mi casa. Ambiente hogareño, patio cerrado, camaras de seguridad. Maximo 3 mascotas. Actualizaciones diarias con fotos.",
      pricePerUnit: 20000,
      priceUnit: "PER_NIGHT",
      duration: 720,
      maxPets: 3,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Providencia",
      latitude: -33.4310,
      longitude: -70.6050,
      radiusKm: 5,
      isActive: true,
    },
  });

  await prisma.serviceAvailability.createMany({
    data: [
      { serviceId: boardingService.id, dayOfWeek: "MONDAY", startTime: "18:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "TUESDAY", startTime: "18:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "WEDNESDAY", startTime: "18:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "THURSDAY", startTime: "18:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "FRIDAY", startTime: "16:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "SATURDAY", startTime: "10:00", endTime: "23:00", maxBookings: 3 },
      { serviceId: boardingService.id, dayOfWeek: "SUNDAY", startTime: "10:00", endTime: "23:00", maxBookings: 3 },
    ],
  });

  const jorgeWalkService = await prisma.service.create({
    data: {
      providerId: jorge.id,
      type: "WALK",
      title: "Paseo razas pequeñas — Nuñoa",
      description: "Paseo grupal de hasta 4 perros pequenos por Parque Bustamante y alrededores. Especial para razas toy y mini. Fotos y video del paseo incluidos.",
      pricePerUnit: 7000,
      priceUnit: "PER_HOUR",
      duration: 60,
      maxPets: 4,
      acceptedSizes: JSON.stringify(["SMALL"]),
      acceptedSpecies: JSON.stringify(["DOG"]),
      city: "Nunoa",
      latitude: -33.4530,
      longitude: -70.5920,
      radiusKm: 6,
      isActive: true,
    },
  });

  await prisma.serviceAvailability.createMany({
    data: [
      { serviceId: jorgeWalkService.id, dayOfWeek: "TUESDAY", startTime: "08:00", endTime: "12:00", maxBookings: 2 },
      { serviceId: jorgeWalkService.id, dayOfWeek: "THURSDAY", startTime: "08:00", endTime: "12:00", maxBookings: 2 },
      { serviceId: jorgeWalkService.id, dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "13:00", maxBookings: 3 },
      { serviceId: jorgeWalkService.id, dayOfWeek: "SUNDAY", startTime: "09:00", endTime: "13:00", maxBookings: 3 },
    ],
  });

  const ramirezVetService = await prisma.service.create({
    data: {
      providerId: drRamirez.id,
      type: "VET_HOME",
      title: "Consulta medicina interna + ecografia",
      description: "Consulta especializada con ecografia portatil incluida. Ideal para casos complejos que requieren diagnostico avanzado sin estres del transporte.",
      pricePerUnit: 55000,
      priceUnit: "PER_VISIT",
      duration: 90,
      maxPets: 1,
      acceptedSizes: JSON.stringify(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
      acceptedSpecies: JSON.stringify(["DOG", "CAT"]),
      city: "Las Condes",
      latitude: -33.4080,
      longitude: -70.5700,
      radiusKm: 20,
      isActive: true,
    },
  });

  await prisma.serviceAvailability.createMany({
    data: [
      { serviceId: ramirezVetService.id, dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00", maxBookings: 4 },
      { serviceId: ramirezVetService.id, dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "18:00", maxBookings: 4 },
      { serviceId: ramirezVetService.id, dayOfWeek: "FRIDAY", startTime: "10:00", endTime: "16:00", maxBookings: 3 },
    ],
  });

  // ─── BOOKING: María reserva hospedaje con Lucia (completado) ────────────

  const boardingBooking = await prisma.booking.create({
    data: {
      serviceId: boardingService.id,
      clientId: maria.id,
      providerId: lucia.id,
      petId: luna.id,
      status: "COMPLETED",
      startDate: new Date("2026-02-28T19:00:00"),
      endDate: new Date("2026-03-02T10:00:00"),
      totalPrice: 42800,
      serviceFee: 2800,
      platformFee: 6000,
      providerEarnings: 34000,
      checkinAt: new Date("2026-02-28T19:10:00"),
      checkoutAt: new Date("2026-03-02T09:55:00"),
      notes: "Luna es alergica al pollo. Su comida viene en bolsa etiquetada.",
    },
  });

  await prisma.bookingEvent.createMany({
    data: [
      { bookingId: boardingBooking.id, type: "CREATED" },
      { bookingId: boardingBooking.id, type: "CONFIRMED" },
      { bookingId: boardingBooking.id, type: "CHECKIN" },
      { bookingId: boardingBooking.id, type: "CHECKOUT" },
      { bookingId: boardingBooking.id, type: "COMPLETED" },
    ],
  });

  await prisma.reportCard.create({
    data: {
      bookingId: boardingBooking.id,
      mood: "HAPPY",
      activities: JSON.stringify(["PLAY", "REST", "SOCIALIZED"]),
      didPee: true,
      didPoop: true,
      ateFood: true,
      drankWater: true,
      notes: "Luna estuvo comodisima. Hizo amigos con mi perrita Chloe. Durmio toda la noche sin problemas.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: boardingBooking.id,
      authorId: maria.id,
      targetId: lucia.id,
      rating: 5,
      punctualityRating: 5,
      careRating: 5,
      communicationRating: 5,
      comment: "Lucia es una cuidadora increible! Luna volvio feliz y bien cuidada. Mandaba fotos todos los dias. Sin duda la volvere a contratar.",
      isVerified: true,
    },
  });

  // ─── BOOKING: María consulta con Dr. Ramirez (completado) ───────────────

  const ramirezBooking = await prisma.booking.create({
    data: {
      serviceId: ramirezVetService.id,
      clientId: maria.id,
      providerId: drRamirez.id,
      petId: max.id,
      status: "COMPLETED",
      startDate: new Date("2026-01-20T11:00:00"),
      endDate: new Date("2026-01-20T12:30:00"),
      totalPrice: 58850,
      serviceFee: 3850,
      platformFee: 8250,
      providerEarnings: 46750,
      checkinAt: new Date("2026-01-20T11:05:00"),
      checkoutAt: new Date("2026-01-20T12:35:00"),
      notes: "Max tiene displasia de cadera. Traer radiografias anteriores.",
    },
  });

  await prisma.bookingEvent.createMany({
    data: [
      { bookingId: ramirezBooking.id, type: "CREATED" },
      { bookingId: ramirezBooking.id, type: "CONFIRMED" },
      { bookingId: ramirezBooking.id, type: "CHECKIN" },
      { bookingId: ramirezBooking.id, type: "COMPLETED" },
    ],
  });

  await prisma.review.create({
    data: {
      bookingId: ramirezBooking.id,
      authorId: maria.id,
      targetId: drRamirez.id,
      rating: 5,
      punctualityRating: 5,
      careRating: 5,
      communicationRating: 5,
      comment: "El Dr. Ramirez es simplemente el mejor. Muy detallado en su explicacion, hizo la ecografia en el momento y me explico todo con paciencia. Max se sintio comodisimo en casa.",
      isVerified: true,
    },
  });

  // ─── CONVERSACIÓN: María ↔ Lucía ────────────────────────────────────────

  const convoLucia = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: maria.id },
          { userId: lucia.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convoLucia.id, senderId: maria.id, content: "Hola Lucia! Vi tu perfil y me parece perfecto para Luna. Tienes disponibilidad del 28 de febrero al 2 de marzo?", createdAt: new Date("2026-02-20T09:00:00") },
      { conversationId: convoLucia.id, senderId: lucia.id, content: "Hola Maria! Si, tengo disponibilidad esas fechas. Cuantame sobre Luna, que tamano tiene y que edad?", createdAt: new Date("2026-02-20T09:15:00") },
      { conversationId: convoLucia.id, senderId: maria.id, content: "Es una Labrador de 3 anos, muy amigable. Solo es alergica al pollo, le llevo su comida especial.", createdAt: new Date("2026-02-20T09:18:00") },
      { conversationId: convoLucia.id, senderId: lucia.id, content: "Perfecto! No hay problema con la comida. Tengo patio cerrado y una camara en el salon. Te mando fotos de las instalaciones.", createdAt: new Date("2026-02-20T09:25:00") },
      { conversationId: convoLucia.id, senderId: maria.id, content: "Me tranquiliza mucho saber que hay camara. Confirmo la reserva!", createdAt: new Date("2026-02-20T09:30:00") },
    ],
  });

  // ─── CONVERSACIÓN: María ↔ Dr. Ramirez ──────────────────────────────────

  const convoRamirez = await prisma.conversation.create({
    data: {
      type: "BOOKING",
      participants: {
        create: [
          { userId: maria.id },
          { userId: drRamirez.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convoRamirez.id, senderId: maria.id, content: "Buenos dias Dr. Ramirez, queria consultar por Max. Tiene displasia de cadera diagnosticada hace un ano.", createdAt: new Date("2026-01-15T10:00:00") },
      { conversationId: convoRamirez.id, senderId: drRamirez.id, content: "Buenos dias Maria! Con gusto lo reviso. Puede traer las radiografias previas? Con la ecografia portatil podemos ver el estado actual de la articulacion.", createdAt: new Date("2026-01-15T10:20:00") },
      { conversationId: convoRamirez.id, senderId: maria.id, content: "Perfecto! Tengo las del ano pasado. Tiene disponibilidad el 20 de enero?", createdAt: new Date("2026-01-15T10:25:00") },
      { conversationId: convoRamirez.id, senderId: drRamirez.id, content: "Si, el 20 a las 11am es perfecto. Le envio la confirmacion por la app. Max no necesita ayuno previo.", createdAt: new Date("2026-01-15T10:30:00") },
    ],
  });

  // ─── MÁS PRODUCTOS ─────────────────────────────────

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Cama ortopédica para perros grandes",
      description: "Cama con memoria foam y funda lavable. Ideal para perros con displasia o artritis. Tallas disponibles: M, L, XL.",
      price: 42990,
      category: "ACCESSORIES",
      photos: JSON.stringify([]),
      stock: 10,
      petSpecies: JSON.stringify(["DOG"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Condroitina + Glucosamina 60 tabletas",
      description: "Suplemento articular para perros. Apoya la salud de cartílagos y articulaciones. Recomendado para displasia y artritis.",
      price: 19990,
      category: "HEALTH",
      photos: JSON.stringify([]),
      stock: 20,
      petSpecies: JSON.stringify(["DOG", "CAT"]),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.product.create({
    data: {
      sellerId: admin.id,
      title: "Arnés anti-jalón talla L",
      description: "Arnés ergonómico con sistema anti-jalón. Distribuye la presión de forma uniforme. Ideal para razas grandes.",
      price: 22990,
      category: "ACCESSORIES",
      photos: JSON.stringify([]),
      stock: 12,
      petSpecies: JSON.stringify(["DOG"]),
      approvalStatus: "APPROVED",
    },
  });

  // ─── VET CLINICS ───────────────────────────────────

  await prisma.vetClinic.create({
    data: {
      name: "Clinica Veterinaria VetPro",
      address: "Av. Providencia 1234, Providencia",
      latitude: -33.4280,
      longitude: -70.6110,
      phone: "+56 2 2234 5678",
      website: "https://vetpro.cl",
      is24h: true,
      isVerified: true,
      services: JSON.stringify(["Urgencias", "Cirugia", "Vacunacion", "Peluqueria", "Rayos X"]),
      openingHours: JSON.stringify({
        monday: { open: "00:00", close: "23:59" },
        tuesday: { open: "00:00", close: "23:59" },
        wednesday: { open: "00:00", close: "23:59" },
        thursday: { open: "00:00", close: "23:59" },
        friday: { open: "00:00", close: "23:59" },
        saturday: { open: "00:00", close: "23:59" },
        sunday: { open: "00:00", close: "23:59" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Clinica Animal Center",
      address: "Av. Las Condes 5678, Las Condes",
      latitude: -33.4120,
      longitude: -70.5780,
      phone: "+56 2 2345 6789",
      is24h: false,
      isVerified: true,
      services: JSON.stringify(["Consulta general", "Vacunacion", "Esterilizacion", "Dental"]),
      openingHours: JSON.stringify({
        monday: { open: "09:00", close: "20:00" },
        tuesday: { open: "09:00", close: "20:00" },
        wednesday: { open: "09:00", close: "20:00" },
        thursday: { open: "09:00", close: "20:00" },
        friday: { open: "09:00", close: "20:00" },
        saturday: { open: "10:00", close: "14:00" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Pet Emergency 24/7",
      address: "Av. Vitacura 3456, Vitacura",
      latitude: -33.3950,
      longitude: -70.5890,
      phone: "+56 2 2456 7890",
      is24h: true,
      isVerified: true,
      services: JSON.stringify(["Urgencias", "UCI", "Cirugia de emergencia", "Rayos X", "Ecografia"]),
      openingHours: JSON.stringify({
        monday: { open: "00:00", close: "23:59" },
        tuesday: { open: "00:00", close: "23:59" },
        wednesday: { open: "00:00", close: "23:59" },
        thursday: { open: "00:00", close: "23:59" },
        friday: { open: "00:00", close: "23:59" },
        saturday: { open: "00:00", close: "23:59" },
        sunday: { open: "00:00", close: "23:59" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Mundo Animal Veterinaria",
      address: "Av. Nunoa 789, Nunoa",
      latitude: -33.4530,
      longitude: -70.5920,
      phone: "+56 2 2567 8901",
      is24h: false,
      isVerified: false,
      services: JSON.stringify(["Consulta general", "Vacunacion", "Peluqueria"]),
      openingHours: JSON.stringify({
        monday: { open: "10:00", close: "19:00" },
        tuesday: { open: "10:00", close: "19:00" },
        wednesday: { open: "10:00", close: "19:00" },
        thursday: { open: "10:00", close: "19:00" },
        friday: { open: "10:00", close: "19:00" },
        saturday: { open: "10:00", close: "15:00" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Clinica Veterinaria Los Leones",
      address: "Av. Los Leones 2345, Providencia",
      latitude: -33.4260,
      longitude: -70.6180,
      phone: "+56 2 2678 9012",
      website: "https://veterinarialesleones.cl",
      is24h: false,
      isVerified: true,
      services: JSON.stringify(["Medicina interna", "Cirugia", "Dermatologia", "Cardiologia", "Vacunacion"]),
      openingHours: JSON.stringify({
        monday: { open: "08:30", close: "20:00" },
        tuesday: { open: "08:30", close: "20:00" },
        wednesday: { open: "08:30", close: "20:00" },
        thursday: { open: "08:30", close: "20:00" },
        friday: { open: "08:30", close: "20:00" },
        saturday: { open: "09:00", close: "15:00" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Centro Veterinario Santa Isabel",
      address: "Av. Santa Isabel 890, Santiago Centro",
      latitude: -33.4490,
      longitude: -70.6390,
      phone: "+56 2 2789 0123",
      is24h: true,
      isVerified: true,
      services: JSON.stringify(["Urgencias 24h", "Consulta general", "Laboratorio", "Imagen (Rx, Eco)", "Cirugia", "UCI"]),
      openingHours: JSON.stringify({
        monday: { open: "00:00", close: "23:59" },
        tuesday: { open: "00:00", close: "23:59" },
        wednesday: { open: "00:00", close: "23:59" },
        thursday: { open: "00:00", close: "23:59" },
        friday: { open: "00:00", close: "23:59" },
        saturday: { open: "00:00", close: "23:59" },
        sunday: { open: "00:00", close: "23:59" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Veterinaria Pata de Terciopelo",
      address: "Av. Irarrázaval 4567, Nunoa",
      latitude: -33.4620,
      longitude: -70.5870,
      phone: "+56 2 2890 1234",
      is24h: false,
      isVerified: true,
      services: JSON.stringify(["Consulta general", "Vacunacion", "Esterilizacion", "Peluqueria", "Hotel mascotas"]),
      openingHours: JSON.stringify({
        monday: { open: "09:00", close: "20:00" },
        tuesday: { open: "09:00", close: "20:00" },
        wednesday: { open: "09:00", close: "20:00" },
        thursday: { open: "09:00", close: "20:00" },
        friday: { open: "09:00", close: "20:00" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { open: "10:00", close: "14:00" },
      }),
    },
  });

  await prisma.vetClinic.create({
    data: {
      name: "Hospital Veterinario Las Condes",
      address: "Av. Apoquindo 7890, Las Condes",
      latitude: -33.4000,
      longitude: -70.5550,
      phone: "+56 2 2901 2345",
      website: "https://hospitalvet.cl",
      is24h: true,
      isVerified: true,
      services: JSON.stringify(["Urgencias", "Especialidades", "Oncologia", "Neurologia", "Ortopedia", "Laboratorio", "UCI"]),
      openingHours: JSON.stringify({
        monday: { open: "00:00", close: "23:59" },
        tuesday: { open: "00:00", close: "23:59" },
        wednesday: { open: "00:00", close: "23:59" },
        thursday: { open: "00:00", close: "23:59" },
        friday: { open: "00:00", close: "23:59" },
        saturday: { open: "00:00", close: "23:59" },
        sunday: { open: "00:00", close: "23:59" },
      }),
    },
  });

  // ─── ADOPCIONES ────────────────────────────────────

  // Post 1: Luna en adopción — urgente (María se muda)
  const lunaAdoptionPost = await prisma.adoptionPost.create({
    data: {
      petId: luna.id,
      posterId: maria.id,
      status: "ACTIVE",
      reason: "MOVING",
      adoptionFee: 0,
      city: "Santiago",
      country: "CL",
      isUrgent: true,
      description: "Me mudo al extranjero y necesito un hogar urgente para Luna. Es muy cariñosa, bien entrenada y ama a los niños. Nunca ha sido agresiva. Vendría con su bolsa de comida, juguetes y libreta de vacunas al día.",
      requirements: JSON.stringify(["Patio o espacio amplio", "Sin niños menores de 4 años", "Personas que pasen tiempo en casa"]),
    },
  });

  // Post 2: Michi en adopción (Ana tiene alergia)
  const michiAdoptionPost = await prisma.adoptionPost.create({
    data: {
      petId: michi.id,
      posterId: ana.id,
      status: "ACTIVE",
      reason: "ALLERGY",
      adoptionFee: 20000,
      city: "Providencia",
      country: "CL",
      isUrgent: false,
      description: "Michi es muy tranquilo y cariñoso. Ideal para departamento. Está esterilizado, vacunado y acostumbrado a convivir con perros. Busco familia responsable que le dé mucho amor.",
      requirements: JSON.stringify(["Hogar tranquilo", "No tener perros grandes"]),
    },
  });

  // Post 3: Toby en tránsito (Sofia rescató otro perro y necesita espacio)
  await prisma.adoptionPost.create({
    data: {
      petId: toby.id,
      posterId: sofia.id,
      status: "ACTIVE",
      reason: "RESCUE",
      adoptionFee: 0,
      city: "Las Condes",
      country: "CL",
      isFosterOnly: true,
      description: "Toby necesita hogar de tránsito mientras encuentra familia definitiva. Es muy energético y alegre. Ideal para familias activas. Todas sus vacunas al día.",
      requirements: JSON.stringify([]),
    },
  });

  // Solicitudes para Luna
  await prisma.adoptionApplication.create({
    data: {
      postId: lunaAdoptionPost.id,
      applicantId: sofia.id,
      status: "PENDING",
      message: "Hola María! Me encantaría darle un hogar a Luna. Tengo una casa con patio amplio en Las Condes. Trabajo desde casa así que estaría acompañada todo el día. Tuve labradores toda mi vida y sé cómo cuidarlos.",
      housingSituation: "HOUSE",
      hasYard: true,
      hasOtherPets: false,
      hasChildren: false,
      workSchedule: "Trabajo desde casa",
      experience: "Tuve labradores toda mi vida, 15 años de experiencia con perros grandes.",
    },
  });

  await prisma.adoptionApplication.create({
    data: {
      postId: lunaAdoptionPost.id,
      applicantId: carlos.id,
      status: "REVIEWED",
      message: "Hola! Soy paseador profesional y amo los labradores. Luna estaría en muy buenas manos conmigo. Tengo patio y mucho tiempo para dedicarle.",
      housingSituation: "HOUSE",
      hasYard: true,
      hasOtherPets: true,
      otherPetsInfo: "Rocky, Bulldog Francés, 3 años, muy tranquilo",
      hasChildren: false,
      workSchedule: "Trabajo flexible, paso mucho tiempo en casa",
      experience: "Paseador profesional con 5 años de experiencia, 127 servicios completados.",
    },
  });

  // Solicitud para Michi
  await prisma.adoptionApplication.create({
    data: {
      postId: michiAdoptionPost.id,
      applicantId: sofia.id,
      status: "PENDING",
      message: "Siempre quise tener un gato. Michi parece perfecto para mi departamento. Vivo sola y le daría toda mi atención.",
      housingSituation: "APARTMENT",
      hasYard: false,
      hasOtherPets: false,
      hasChildren: false,
      workSchedule: "Trabajo presencial de lunes a viernes, horario 9-18h",
      experience: "Primera vez con gatos pero he investigado bastante.",
    },
  });

  // ─── INSURANCE PROVIDERS ────────────────────────────

  const petprotect = await prisma.user.create({
    data: {
      email: "contacto@petprotect.cl",
      name: "PetProtect Seguros",
      passwordHash,
      role: "INSURANCE_PROVIDER",
      city: "Santiago",
      bio: "Aseguradora especializada en mascotas con más de 10 años de experiencia en el mercado chileno.",
      phone: "+56 2 2345 6789",
    },
  });

  const woofseguros = await prisma.user.create({
    data: {
      email: "info@woofseguros.cl",
      name: "WoofSeguros",
      passwordHash,
      role: "INSURANCE_PROVIDER",
      city: "Santiago",
      bio: "Seguros flexibles para perros y gatos. Cobertura desde urgencias hasta cirugías complejas.",
      phone: "+56 2 9876 5432",
    },
  });

  // ─── INSURANCE PLANS ────────────────────────────────

  const planBasico = await prisma.insurancePlan.create({
    data: {
      providerId:    petprotect.id,
      name:          "Plan Básico",
      description:   "Cobertura esencial para urgencias y accidentes. Ideal para mascotas jóvenes y saludables que necesitan protección ante imprevistos.",
      providerName:  "PetProtect",
      price:         9990,
      annualPrice:   99900,
      coverages:     JSON.stringify(["🏥 Urgencias veterinarias", "🚑 Accidentes", "💊 Medicamentos básicos", "📞 Telemedicina 24/7"]),
      petSpecies:    JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:  96,   // 8 años
      deductible:    15000,
      maxCoverage:   500000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:    new Date(),
    },
  });

  const planCompleto = await prisma.insurancePlan.create({
    data: {
      providerId:    petprotect.id,
      name:          "Plan Completo",
      description:   "Cobertura total: enfermedades crónicas, cirugías, exámenes de laboratorio y más. La protección más completa para tu mascota.",
      providerName:  "PetProtect",
      price:         24990,
      annualPrice:   249900,
      coverages:     JSON.stringify(["🏥 Enfermedades crónicas", "🔬 Exámenes de laboratorio", "🩺 Cirugías electivas y de urgencia", "💊 Medicamentos", "🦷 Salud dental preventiva", "📞 Telemedicina 24/7"]),
      petSpecies:    JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:  120,  // 10 años
      deductible:    10000,
      maxCoverage:   2000000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:    new Date(),
    },
  });

  const _planSenior = await prisma.insurancePlan.create({
    data: {
      providerId:    woofseguros.id,
      name:          "Seguro Senior",
      description:   "Diseñado especialmente para mascotas mayores de 7 años. Cubre enfermedades crónicas y tratamientos de larga duración.",
      providerName:  "WoofSeguros",
      price:         19990,
      annualPrice:   199900,
      coverages:     JSON.stringify(["🏥 Control de enfermedades crónicas", "💊 Medicación continua cubierta", "🩺 Consultas con especialistas", "🔬 Exámenes periódicos", "🛏 Hospitalización"]),
      petSpecies:    JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:  null, // sin límite de edad máxima
      deductible:    20000,
      maxCoverage:   1500000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:    new Date(),
    },
  });

  const _planFamiliar = await prisma.insurancePlan.create({
    data: {
      providerId:    woofseguros.id,
      name:          "Plan Familiar",
      description:   "Hasta 3 mascotas en un solo plan con descuento especial. Cobertura completa para toda la familia peluda.",
      providerName:  "WoofSeguros",
      price:         34990,
      annualPrice:   349900,
      coverages:     JSON.stringify(["🐾 Hasta 3 mascotas incluidas", "🏥 Urgencias para todas", "🔬 Chequeo preventivo anual", "💊 Medicamentos básicos", "📞 Telemedicina 24/7", "🚑 Traslado de emergencia"]),
      petSpecies:    JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:  96,
      deductible:    12000,
      maxCoverage:   800000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:    new Date(),
    },
  });

  // ─── INSURANCE POLICIES (ejemplos para maria y sofia) ──

  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  // Maria tiene Luna con Plan Básico (activa)
  const policyLuna = await prisma.insurancePolicy.create({
    data: {
      userId:          maria.id,
      planId:          planBasico.id,
      petId:           luna.id,
      status:          "ACTIVE",
      startDate:       new Date("2026-01-01"),
      endDate:         new Date("2026-02-01"),
      autoRenew:       true,
      totalPaid:       9990,
      platformFee:     Math.round(9990 * 0.15),
      providerEarnings: Math.round(9990 * 0.85),
      stripeSessionId: "cs_seed_luna_001",
    },
  });

  await prisma.insurancePolicyPayment.create({
    data: {
      policyId:        policyLuna.id,
      amount:          9990,
      platformFee:     Math.round(9990 * 0.15),
      providerEarnings: Math.round(9990 * 0.85),
      status:          "SUCCEEDED",
      stripeSessionId: "cs_seed_luna_pay_001",
      period:          "2026-01",
      paidAt:          new Date("2026-01-01"),
    },
  });

  // Sofia tiene Toby con Plan Completo (activa)
  const policyToby = await prisma.insurancePolicy.create({
    data: {
      userId:          sofia.id,
      planId:          planCompleto.id,
      petId:           toby.id,
      status:          "ACTIVE",
      startDate:       new Date("2026-02-01"),
      endDate:         new Date("2026-03-01"),
      autoRenew:       true,
      totalPaid:       24990,
      platformFee:     Math.round(24990 * 0.15),
      providerEarnings: Math.round(24990 * 0.85),
      stripeSessionId: "cs_seed_toby_001",
    },
  });

  await prisma.insurancePolicyPayment.create({
    data: {
      policyId:        policyToby.id,
      amount:          24990,
      platformFee:     Math.round(24990 * 0.15),
      providerEarnings: Math.round(24990 * 0.85),
      status:          "SUCCEEDED",
      stripeSessionId: "cs_seed_toby_pay_001",
      period:          "2026-02",
      paidAt:          new Date("2026-02-01"),
    },
  });

  console.log("Seed completed!");
  console.log("");
  console.log("Users created:");
  console.log("  Admin:    admin@petmatch.cl  / 123456");
  console.log("  Owner:    maria@email.com    / 123456 (PREMIUM) — 2 perros, historial médico completo");
  console.log("  Walker:   carlos@email.com   / 123456 — proveedor verificado (127 servicios)");
  console.log("  Owner:    ana@email.com       / 123456");
  console.log("  Clinic:   clinica@vetpro.cl  / 123456");
  console.log("  Owner:    sofia@email.com    / 123456 (FREE)");
  console.log("  Groomer:  pedro@email.com    / 123456 — proveedor verificado");
  console.log("  Vet:      valentina@email.com / 123456 — veterinaria a domicilio");
  console.log("  Boarding: lucia@email.com    / 123456 — hospedaje en casa");
  console.log("  Walker:   jorge@email.com    / 123456 — razas pequeñas");
  console.log("  Vet:      dr.ramirez@email.com / 123456 — medicina interna (412 servicios)");
  console.log("");
  console.log("Data seeded:");
  console.log("  - 11 users (admin, 3 owners, 5 proveedores, 1 clinic)");
  console.log("  - 6 pets (5 dogs + 1 cat)");
  console.log("  - 6 provider profiles with badges");
  console.log("  - 10 services with availability");
  console.log("  - 11 bookings (4 completed, 2 confirmed, 1 pending, 1 cancelled, 1 in-progress)");
  console.log("  - 6 reviews (todos verificados)");
  console.log("  - 5 conversations with messages");
  console.log("  - 5 swipes (1 match: Luna ↔ Coco)");
  console.log("  - 9 products in marketplace");
  console.log("  - 2 orders (1 delivered, 1 pending)");
  console.log("  - 2 favorites, 6 notifications, 1 incident");
  console.log("  - 2 subscriptions (PREMIUM + FREE)");
  console.log("  - 6 reminders, 9 vet clinics");
  console.log("  - 6 medical visits (Luna: 3, Max: 3)");
  console.log("  - 3 adoption posts (Luna urgente, Michi, Toby tránsito)");
  console.log("  - 3 adoption applications");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

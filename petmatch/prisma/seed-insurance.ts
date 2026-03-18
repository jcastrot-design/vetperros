import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

function createClient() {
  const url = process.env.DATABASE_URL || "";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: url });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

async function main() {
  const existing = await prisma.insurancePlan.findFirst();
  if (existing) {
    console.log("Insurance data already seeded, skipping.");
    return;
  }

  console.log("Seeding insurance data...");

  const passwordHash = await bcrypt.hash("123456", 12);

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

  await prisma.insurancePlan.create({
    data: {
      providerId:     petprotect.id,
      name:           "Plan Básico",
      description:    "Cobertura esencial para urgencias y accidentes. Ideal para mascotas jóvenes y saludables que necesitan protección ante imprevistos.",
      providerName:   "PetProtect",
      price:          9990,
      annualPrice:    99900,
      coverages:      JSON.stringify(["🏥 Urgencias veterinarias", "🚑 Accidentes", "💊 Medicamentos básicos", "📞 Telemedicina 24/7"]),
      petSpecies:     JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:   96,
      deductible:     15000,
      maxCoverage:    500000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:     new Date(),
    },
  });

  await prisma.insurancePlan.create({
    data: {
      providerId:     petprotect.id,
      name:           "Plan Completo",
      description:    "Cobertura total: enfermedades crónicas, cirugías, exámenes de laboratorio y más. La protección más completa para tu mascota.",
      providerName:   "PetProtect",
      price:          24990,
      annualPrice:    249900,
      coverages:      JSON.stringify(["🏥 Enfermedades crónicas", "🔬 Exámenes de laboratorio", "🩺 Cirugías electivas y de urgencia", "💊 Medicamentos", "🦷 Salud dental preventiva", "📞 Telemedicina 24/7"]),
      petSpecies:     JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:   120,
      deductible:     10000,
      maxCoverage:    2000000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:     new Date(),
    },
  });

  await prisma.insurancePlan.create({
    data: {
      providerId:     woofseguros.id,
      name:           "Seguro Senior",
      description:    "Diseñado especialmente para mascotas mayores de 7 años. Cubre enfermedades crónicas y tratamientos de larga duración.",
      providerName:   "WoofSeguros",
      price:          19990,
      annualPrice:    199900,
      coverages:      JSON.stringify(["🏥 Control de enfermedades crónicas", "💊 Medicación continua cubierta", "🩺 Consultas con especialistas", "🔬 Exámenes periódicos", "🛏 Hospitalización"]),
      petSpecies:     JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:   null,
      deductible:     20000,
      maxCoverage:    1500000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:     new Date(),
    },
  });

  await prisma.insurancePlan.create({
    data: {
      providerId:     woofseguros.id,
      name:           "Plan Familiar",
      description:    "Hasta 3 mascotas en un solo plan con descuento especial. Cobertura completa para toda la familia peluda.",
      providerName:   "WoofSeguros",
      price:          34990,
      annualPrice:    349900,
      coverages:      JSON.stringify(["🐾 Hasta 3 mascotas incluidas", "🏥 Urgencias para todas", "🔬 Chequeo preventivo anual", "💊 Medicamentos básicos", "📞 Telemedicina 24/7", "🚑 Traslado de emergencia"]),
      petSpecies:     JSON.stringify(["DOG", "CAT"]),
      maxAgeMonths:   96,
      deductible:     12000,
      maxCoverage:    800000,
      commissionRate: 0.15,
      approvalStatus: "APPROVED",
      approvedAt:     new Date(),
    },
  });

  // ─── SAMPLE POLICIES ─────────────────────────────────
  // Busca usuarios y mascotas existentes para crear pólizas de ejemplo

  const plans = await prisma.insurancePlan.findMany({ take: 2 });
  const pets  = await prisma.pet.findMany({ take: 2, include: { owner: true } });

  for (let i = 0; i < Math.min(pets.length, plans.length); i++) {
    const pet  = pets[i];
    const plan = plans[i];
    const start = new Date("2026-01-01");
    const end   = new Date("2026-02-01");

    const policy = await prisma.insurancePolicy.create({
      data: {
        userId:           pet.ownerId,
        planId:           plan.id,
        petId:            pet.id,
        status:           "ACTIVE",
        startDate:        start,
        endDate:          end,
        autoRenew:        true,
        totalPaid:        plan.price,
        platformFee:      Math.round(plan.price * plan.commissionRate),
        providerEarnings: Math.round(plan.price * (1 - plan.commissionRate)),
        stripeSessionId:  `cs_seed_${pet.id}_${plan.id}`,
      },
    });

    await prisma.insurancePolicyPayment.create({
      data: {
        policyId:         policy.id,
        amount:           plan.price,
        platformFee:      Math.round(plan.price * plan.commissionRate),
        providerEarnings: Math.round(plan.price * (1 - plan.commissionRate)),
        status:           "SUCCEEDED",
        stripeSessionId:  `cs_seed_pay_${pet.id}_${plan.id}`,
        period:           "2026-01",
        paidAt:           start,
      },
    });
  }

  console.log("");
  console.log("Insurance data seeded:");
  console.log("  - 2 insurance providers (PetProtect, WoofSeguros)");
  console.log("    contacto@petprotect.cl / 123456");
  console.log("    info@woofseguros.cl    / 123456");
  console.log("  - 4 approved insurance plans");
  console.log(`  - ${Math.min(pets.length, plans.length)} sample policies (ACTIVE)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

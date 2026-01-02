import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // 1. ADMIN USER
  // ======================
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gambling.demo" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@gambling.demo",
      password: adminPassword,
      role: Role.ADMIN,
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  });

  // ======================
  // 2. DEMO USER
  // ======================
  const userPassword = await bcrypt.hash("user123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@gambling.demo" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@gambling.demo",
      password: userPassword,
      role: Role.USER,
      wallet: {
        create: {
          balance: 10000, // fake demo balance
        },
      },
    },
  });

  // ======================
  // 3. AVIATOR GAME
  // ======================
  const aviatorGame = await prisma.game.upsert({
    where: { slug: "aviator" },
    update: {},
    create: {
      name: "Aviator",
      slug: "aviator",
      minBet: 10,
      maxBet: 1000,
      rtp: 95,
      isActive: true,
    },
  });

  

  // ======================
  // 4. ADMIN SETTINGS
  // ======================
  await prisma.adminSetting.upsert({
    where: { id: "global-settings" },
    update: {},
    create: {
      id: "global-settings",
      globalRtp: 95,
      isPlatformLive: true,
    },
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

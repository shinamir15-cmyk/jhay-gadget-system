import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin user (unchanged from Phase 4) ---
  const email = "admin@example.com";
  const plainPassword = "admin123";

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await prisma.user.create({
      data: { name: "Admin", email, password: hashedPassword },
    });
    console.log(`Admin user created: ${email} / ${plainPassword}`);
  } else {
    console.log("Admin user already exists.");
  }

  // --- Main Store branch (new) ---
  const existingMain = await prisma.branch.findFirst({ where: { isMain: true } });
  if (!existingMain) {
    const mainBranch = await prisma.branch.create({
      data: { name: "Main Store", code: "MAIN", isMain: true },
    });
    console.log(`Main Store branch created: ${mainBranch.id}`);
  } else {
    console.log("Main Store branch already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
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
  const mainBranch = await prisma.branch.findFirst({ where: { isMain: true } });
  if (!mainBranch) {
    throw new Error("Main Store branch not found — run seed.ts first.");
  }

  const result = await prisma.inventoryUnit.updateMany({
    where: { currentBranchId: null },
    data: { currentBranchId: mainBranch.id },
  });

  console.log(`Backfilled ${result.count} unit(s) to Main Store.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
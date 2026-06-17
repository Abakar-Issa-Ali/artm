import { PrismaClient } from "@prisma/client";

declare const process: {
  exit(code?: number): void;
};

const prisma = new PrismaClient();

async function main() {
  // Crée les deux rôles s'ils n'existent pas déjà
  await prisma.role.upsert({
    where: { libelle: "membre" },
    update: {},
    create: { libelle: "membre", montantCotisation: 5.0 },
  });

  await prisma.role.upsert({
    where: { libelle: "bureau" },
    update: {},
    create: { libelle: "bureau", montantCotisation: 10.0 },
  });

  console.log("Rôles créés : membre (5€), bureau (10€)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
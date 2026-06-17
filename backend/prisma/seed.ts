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

  await prisma.role.upsert({
    where: { libelle: "tresorier" },
    update: {},
    create: { libelle: "tresorier", montantCotisation: 10.0 },
  });

  // Membre de test adhérent depuis 4 mois (pour démontrer les retards)
  const bcrypt = await import("bcrypt");
  const roleMembre = await prisma.role.findUnique({ where: { libelle: "membre" } });

  if (roleMembre) {
    const dateAdhesionPassee = new Date();
    dateAdhesionPassee.setMonth(dateAdhesionPassee.getMonth() - 4);

    await prisma.membre.upsert({
      where: { email: "test@artm.fr" },
      update: {},
      create: {
        nom: "Test",
        prenom: "Demo",
        email: "test@artm.fr",
        motDePasse: await bcrypt.hash("Test1234", 10),
        roleId: roleMembre.id,
        dateAdhesion: dateAdhesionPassee,
      },
    });
    console.log("Membre de test créé : test@artm.fr / Test1234 (adhérent depuis 4 mois)");
  }

  // Compte trésorier de test
  const roleTresorier = await prisma.role.findUnique({ where: { libelle: "tresorier" } });
  if (roleTresorier) {
    const bcrypt = await import("bcrypt");
    await prisma.membre.upsert({
      where: { email: "tresorier@artm.fr" },
      update: {},
      create: {
        nom: "Hawa",
        prenom: "Tresoriere",
        email: "tresorier@artm.fr",
        motDePasse: await bcrypt.hash("Tresor1234", 10),
        roleId: roleTresorier.id,
      },
    });
    console.log("Compte trésorier créé : tresorier@artm.fr / Tresor1234");
  }

    console.log("Rôles créés : membre (5€), bureau (10€)");
}


main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
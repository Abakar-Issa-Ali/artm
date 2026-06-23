import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Récupère les coordonnées (en crée une ligne vide si aucune n'existe encore)
export async function getCoordonnees() {
  let coordonnees = await prisma.coordonneesPaiement.findFirst();
  if (!coordonnees) {
    coordonnees = await prisma.coordonneesPaiement.create({ data: {} });
  }
  return coordonnees;
}

// Met à jour les coordonnées (réservé au trésorier)
export async function updateCoordonnees(data: {
  iban?: string;
  titulaire?: string;
  reference?: string;
  numeroWero?: string;
  noteCarte?: string;
}) {
  const existante = await prisma.coordonneesPaiement.findFirst();
  if (!existante) {
    return prisma.coordonneesPaiement.create({ data });
  }
  return prisma.coordonneesPaiement.update({
    where: { id: existante.id },
    data,
  });
}
import prisma from "../config/prisma.js";

// Crée un paiement
export async function create(data: {
  membreId: number;
  cotisationId: number;
  montant: number;
  mode: string;
  statut: string;
}) {
  return prisma.paiement.create({ data });
}

// Récupère un paiement par son id (avec sa cotisation)
export async function findById(id: number) {
  return prisma.paiement.findUnique({
    where: { id },
    include: { cotisation: true },
  });
}

// Récupère tous les paiements en attente de validation (pour le trésorier)
export async function findEnAttente() {
  return prisma.paiement.findMany({
    where: { statut: "declare" },
    include: { membre: true, cotisation: true },
    orderBy: { dateDeclaration: "asc" },
  });
}

// Met à jour le statut et la date de validation d'un paiement
export async function updateStatut(
  id: number,
  statut: string,
  dateValidation?: Date
) {
  return prisma.paiement.update({
    where: { id },
    data: { statut, dateValidation },
  });
}